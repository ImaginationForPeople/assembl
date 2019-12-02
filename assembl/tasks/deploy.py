from __future__ import print_function

import os
import os.path
import re
import build
from pprint import pprint
from time import sleep
from ConfigParser import RawConfigParser
from getpass import getuser

from .common import (
    setup_ctx, running_locally, exists, venv, venv_py3, task, local_code_root,
    create_venv, fill_template, get_s3_file, s3_file_exists, get_aws_account_id, delete_foreign_tasks,
    get_assembl_code_path, is_cloud_env, yaml_to_ini, is_supervisord_running)


@task()
def print_config(c):
    pprint(c.config.__dict__)


@task()
def create_var_dir(c):
    c.run('mkdir -p var/run var/share var/log var/db')
    c.run('chgrp www-data . var var/run var/share')
    c.run('chmod -R g+rxs var/run var/share')
    c.run('touch var/share/assembl.nginx')


def get_region(c):
    region = c.config.get('aws_region', None)
    if not region:
        region = os.getenv("AWS_DEFAULT_REGION", None)
    if not region:
        import requests
        r = requests.get('http://169.254.169.254/latest/meta-data/placement/availability-zone')
        assert r.ok
        region = r.content[:-1]
    return region


def get_and_set_region(c):
    c.config.aws_region = get_region(c)
    return c.config.aws_region


def seperate_post_pip_install(c, package_name, wrapper, v_def):
    from importlib import import_module
    package = import_module(package_name)
    _version = package.__version__
    version = v_def(_version)
    cmd = 'pip install {}=={}'.format(package_name, version)
    if wrapper:
        cmd = wrapper % (cmd,)
    with venv(c):
        c.run(cmd)


@task()
def post_pip_update(c):

    with venv(c, True):
        # A list of special packages that need to be re-installed, because they hate you
        # [package_name, instalation command with special instructions, package version extraction func]
        special_commands = [
            ("psycopg2", "%s --ignore-installed --install-option='-q'", lambda v: re.search(r'(\d\.)+\w', v).group(0))
        ]
        for package_name, wrapper, func in special_commands:
            seperate_post_pip_install(c, package_name, wrapper, func)


@task(create_venv, post=[post_pip_update])
def install_wheel(c, allow_index=False):
    wheelhouse = os.getenv('ASSEMBL_WHEELHOUSE', c.config.get(
        'wheelhouse', 's3://bluenove-assembl-wheelhouse'))
    # temporary: we will use assembl-([\d\.]*)-py27-none-any.whl
    wheel = os.getenv('ASSEMBL_WHEEL', c.config.get(
        'assembl_wheel', 'assembl-(.*)-py2-none-any\.whl'))
    allow_index = '' if allow_index else '--no-index'

    def as_semantic(match):
        version = match.group(2)
        version = '-alpha.'.join(version.split('.dev'))
        return Version.coerce(version)
    if wheelhouse.startswith('s3://'):
        wheelhouse = wheelhouse[5:]
        with venv(c, True):
            if '(' in wheel:
                import requests
                from semantic_version import Version
                r = requests.get('http://{wheelhouse}.s3-website-eu-west-1.amazonaws.com/'.format(
                    wheelhouse=wheelhouse))
                assert r.ok
                exp = '>(' + wheel + ')<'
                matches = list(re.finditer(exp, r.content))
                # assumption: The first * follows semver, more or less.
                matches.sort(reverse=True, key=as_semantic)
                wheel = matches[0].group(1)
            host = '{wheelhouse}.s3-website-eu-west-1.amazonaws.com'.format(wheelhouse=wheelhouse)
            c.run('./venv/bin/pip --trusted-host {host} install {allow_index}'
                  ' --find-links http://{host}/ http://{host}/{wheel}'.format(
                      host=host, wheel=wheel, allow_index=allow_index))
    else:
        with venv(c, True):
            if '(' in wheel:
                wheelre = re.compile('(%s)$' % wheel)
                wheels = [wheelre.match(name) for name in os.listdir(wheelhouse)]
                wheels = filter(None, wheels)
                matches.sort(reverse=True, key=as_semantic)
                wheel = matches[0].group(1)
            c.run('./venv/bin/pip install {allow_index} --find-links {wheelhouse} {wheelhouse}/{wheel}'.format(
                wheel=wheel, wheelhouse=wheelhouse, allow_index=allow_index))


@task()
def setup_aws_default_region(c):
    assert running_locally(c)
    region = get_and_set_region(c)
    assert region
    c.run('aws configure set region ' + region)


CELERY_YAML = """_extends: terraform.yaml
supervisor:
  autostart_celery: true
  autostart_celery_notify_beat: true
  autostart_uwsgi: false
"""


@task()
def get_aws_invoke_yaml(c, celery=False):
    assert running_locally(c)
    account = get_aws_account_id(c)
    assert account, "Could not get aws account"
    # This introduces a convention: yaml files
    # for a given amazon account will be stored in
    # s3://assembl-data-{account_id}/{fname}.yaml

    def write_config_to_disk(path, content):
        with open(path, 'w') as f:
            f.write(content)

    invoke_path = os.path.join(c.config.projectpath, 'invoke.yaml')
    bucket = 'assembl-data-' + account
    account_data_name = 'account_data.yaml'
    cicd_name = 'cicd.yaml'
    cicd_path = os.path.join(c.config.projectpath, cicd_name)

    content = None
    if s3_file_exists(bucket, account_data_name):
        content = "_extends: %s" % account_data_name
    else:
        content = "_extends: %s" % cicd_name
    # Create a top-level invoke.yaml file
    write_config_to_disk(invoke_path, content)

    extends_re = re.compile(r'\b_extends:\s*(\w+\.yaml)')
    match = extends_re.search(content)
    while match:
        key = match.group(1)
        if celery and key == cicd_name:
            # In the condition of Celery instance
            write_config_to_disk(cicd_path, CELERY_YAML)
            match = extends_re.search(CELERY_YAML)
            continue
        # assuming local bucket; what if from shared region?
        # maybe look for client_id in bucket name, assume shared otherwise???
        ex_content = get_s3_file(bucket, key)
        if not ex_content:
            break
        write_config_to_disk(os.path.join(c.config.projectpath, key), ex_content)
        match = extends_re.search(ex_content)
    if not content:
        raise RuntimeError("invoke.yaml was not defined in S3" % account)


@task()
def ensure_aws_invoke_yaml(c, override=True, celery=False):
    if not exists(c, 'invoke.yaml') or override:
        get_aws_invoke_yaml(c, celery)


def is_supervisord_running(c):
    with venv(c, True):
        result = c.run('supervisorctl pid')
    if not result or 'no such file' in result.stdout or 'refused connection' in result.stdout:
        return False
    try:
        pid = int(result.stdout)
        if pid:
            return True
    except ValueError:
        return False


@task()
def supervisor_shutdown(c):
    """
    Shutdown Assembl's supervisor
    """
    if not is_supervisord_running(c):
        return
    with venv(c, True):
        c.run("supervisorctl shutdown")
    for i in range(10):
        sleep(6)
        with venv(c, True):
            result = c.run("supervisorctl status", warn=True)
        if not result.failed:
            break
    # Another supervisor, upstart, etc may be watching it, give it more time
    sleep(6)


@task()
def supervisor_restart(c):
    """Restart supervisor itself."""
    supervisor_shutdown(c)
    with venv(c, True):
        result = c.run("supervisorctl status")
        if "no such file" in result.stdout:
            c.run("supervisord")


@task()
def webservers_stop(c):
    """Stop all webservers."""
    c.sudo('/etc/init.d/nginx stop')


@task()
def webservers_start(c):
    """Start all webservers."""
    c.sudo("/etc/init.d/nginx start")


@task()
def webservers_reload(c):
    """
    Reload the webserver stack.
    """
    # Nginx (sudo is part of command line here because we don't have full
    # sudo access
    print("Reloading nginx")
    if os.path.exists('/etc/init.d/nginx'):
        result = c.sudo('/usr/sbin/nginx -t')
        if "Command exited with status 0" in str(result):
            c.sudo('/etc/init.d/nginx reload')
        else:
            print("Your Nginx configuration returned an error, please check your nginx configuration.")


@task(ensure_aws_invoke_yaml)
def create_local_ini(c):
    """Compose local.ini from the given .yaml file"""
    from assembl.scripts.ini_files import extract_saml_info, populate_random, find_ini_file, combine_ini
    assert running_locally(c)
    c.config.DEFAULT = c.config.get('DEFAULT', {})
    c.config.DEFAULT['code_root'] = c.config.code_root  # Is this used?
    # Special case: uwsgi does not do internal computations.
    if 'uwsgi' not in c.config:
        c.config.uwsgi = {}
    c.config.uwsgi.virtualenv = c.config.projectpath + '/venv'
    ini_sequence = c.config.get('ini_files', None)
    assert ini_sequence, "Define ini_files"
    ini_sequence = ini_sequence.split()
    base = RawConfigParser()
    random_file = c.config.get('random_file', None)
    for overlay in ini_sequence:
        if overlay == 'RC_DATA':
            overlay = yaml_to_ini(c.config)
        elif overlay.startswith('RANDOM'):
            templates = overlay.split(':')[1:]
            overlay = populate_random(
                random_file, templates, extract_saml_info(c.config))
        else:
            overlay = find_ini_file(overlay, os.path.join(c.config.code_root, 'assembl', 'configs'))
            assert overlay, "Cannot find " + overlay
        combine_ini(base, overlay)
    ini_file_name = c.config.get('_internal', {}).get('ini_file', 'local.ini')
    local_ini_path = os.path.join(c.config.projectpath, ini_file_name)
    if exists(c, local_ini_path):
        c.run('cp %s %s.bak' % (local_ini_path, local_ini_path))
    with open(local_ini_path, 'w') as f:
        base.write(f)


@task(ensure_aws_invoke_yaml)
def generate_nginx_conf(c):
    """Hard assumption that this is only used under the cloud condition"""
    if is_cloud_env(c):
        path = os.path.join(get_assembl_code_path(c), 'templates/system/')
        fill_template(c, 'nginx_default.jinja2', 'var/share/assembl.nginx',
                      default_dir=path, extra={'is_cloud': True})


@task(create_local_ini)
def generate_supervisor_conf(c):
    with venv(c, True):
        ini_file = c.config.get('_internal', {}).get('ini_file', 'local.ini')
        c.run('assembl-ini-files populate %s' % (ini_file))


@task()
def download_rds_pem(c, reset=False):
    if reset or not exists(c, 'rds-combined-ca-bundle.pem'):
        c.run('wget https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem')


@task(generate_nginx_conf, generate_supervisor_conf)
def aws_server_startup_from_local(c):
    """Update files that depend on local.rc and restart nginx, supervisor"""
    if is_supervisord_running(c):
        supervisor_restart(c)
    else:
        with venv(c, True):
            c.run('supervisord')
    webservers_reload(c)


@task(setup_aws_default_region, ensure_aws_invoke_yaml, download_rds_pem, post=[aws_server_startup_from_local])
def aws_instance_startup(c):
    """Operations to startup a fresh aws instance from an assembl AMI"""
    if not exists(c, c.config.projectpath + "/invoke.yaml"):
        raise RuntimeError("Missing invoke.yaml file")
    setup_ctx(c)


@task(setup_aws_default_region, ensure_aws_invoke_yaml, download_rds_pem, install_wheel, post=[aws_server_startup_from_local])
def aws_instance_update_and_startup(c):
    """Operations to startup a fresh aws instance from an assembl AMI"""
    if not exists(c, c.config.projectpath + "/invoke.yaml"):
        raise RuntimeError("Missing invoke.yaml file")
    setup_ctx(c)


@task(setup_aws_default_region, download_rds_pem, post=[aws_server_startup_from_local])
def aws_celery_instance_startup(c):
    """Operations to startup a fresh celery aws instance from an assembl AMI"""
    ensure_aws_invoke_yaml(c, celery=True)
    if not exists(c, c.config.projectpath + "/invoke.yaml"):
        raise RuntimeError("Missing invoke.yaml file")
    setup_ctx(c)


@task(setup_aws_default_region, post=[aws_server_startup_from_local])
def aws_instance_config_update_and_restart(c, nginx=False, celery=False):
    if celery:
        get_aws_invoke_yaml(c, True)
    else:
        ensure_aws_invoke_yaml(c, override=True)
    create_local_ini(c)
    if nginx:
        generate_nginx_conf(c)
    setup_ctx(c)


@task(install_wheel)
def assembl_dir_permissions(c):
    with venv(c):
        code_path = get_assembl_code_path(c)
    c.run('chgrp -R www-data {path}/assembl/static {path}/assembl/static2'.format(path=code_path))
    c.run('find {path}/assembl/static -type d -print0 |xargs -0 chmod g+rxs'.format(path=code_path))
    c.run('find {path}/assembl/static -type f -print0 |xargs -0 chmod g+r'.format(path=code_path))
    c.run('find {path}/assembl/static2 -type d -print0 |xargs -0 chmod g+rxs'.format(path=code_path))
    c.run('find {path}/assembl/static2 -type f -print0 |xargs -0 chmod g+r'.format(path=code_path))
    c.run('chmod go+x {path}/assembl/scripts'.format(path=code_path))
    c.run('chmod go+r {path}/assembl/scripts/pypsql.py'.format(path=code_path))


@task()
def generate_graphql_documentation(c):
    """Generate HTML documentation page based on graphql schema file."""
    with venv(c):
        with c.cd(os.path.join(c.projectpath, 'assembl/static2/')):
            c.run('npm run documentation')


@task()
def install_bluenove_actionable(c):
    """Install the bluenove_actionable app."""
    if not exists(c, "%s/bluenove-actionable/" % c.config.projectpath):
        with c.cd(c.config.projectpath):
            c.run('git clone git@github.com:bluenove/bluenove-actionable.git')

        with c.cd(os.path.join(c.config.projectpath, '..', 'bluenove-actionable')):
            c.run('mkdir -p data && chmod o+rwx data')
            c.run('docker-compose build', warn=True)


def get_robot_machine(c):
    """Returns the configured robot machine"""
    machines = c.get('machines', '')
    if machines:
        robot = machines.split('/')[0]
        robot_data = robot.split(',')
        if len(robot_data) != 3:
            print ("The data of the user machine are wrong! %s" % robot)
            return None

        return {
            'identifier': robot_data[0].strip(),
            'name': robot_data[1].strip(),
            'password': robot_data[2].strip()
        }
    print("No user machine found!")
    return None


@task()
def start_bluenove_actionable(c):
    """Starts Bigdatext algorithm."""
    path = os.path.join(c.projectpath, '..', 'bluenove-actionable')
    robot = get_robot_machine(c)
    if exists(c, path) and robot:
        url_instance = c.public_hostname
        if url_instance == 'localhost':
            ip = c.run("/sbin/ip -o -4 addr list eth0 | awk '{print $4}' | cut -d/ -f1")
            url_instance = 'http://{}:{}'.format(ip, c.public_port)
            with c.cd(path):
                c.run('docker-compose up -d', warn=True, env={'URL_INSTANCE': url_instance, 'ROBOT_IDENTIFIER': robot.get('identifier'), 'ROBOT_PASSWORD': robot.get('password')})


@task()
def stop_bluenove_actionable(c):
    """Stops Bigdatatext algorithm."""
    path = os.path.join(c.projectpath, '..', 'bluenove-actionable')
    if exists(c, path):
        with c.cd(path):
            c.run('docker-compose down', warn=True)


@task()
def restart_bluenove_actionable(c):
    """Restart Bigdatext algorithm."""
    stop_bluenove_actionable(c)
    start_bluenove_actionable(c)


@task()
def update_bluenove_actionable(c):
    """Update bluenove_actionable git repository and rebuilding tha app."""
    path = os.path.join(c.projectpath, '..', 'bluenove-actionable')
    if exists(c, path):
        with c.cd(path):
            c.run('git pull')
            c.run('docker system prune --volumes -f', warn=True)
            c.run('mkdir -p data && chmod o+rwx data')
            c.run('docker-compose build --no-cache', warn=True)
            restart_bluenove_actionable(c)


@task()
def update_url_metadata(c):
    """Update url metadata microservice."""
    path = os.path.join(c.projectpath, '..', 'url_metadata')
    if exists(c, path):
        with c.cd(path):
            c.run('git pull')
        with venv_py3(c):
            c.run('pip install -e ../url_metadata')


@task()
def app_setup(c):
    """Setup the environment so the appliation can run"""
    if not c.config.package_install:
        with venv(c, True):
            c.run('pip install -e ./')
        create_var_dir(c)
        if not exists(c, c.config.ini_file):
            create_local_ini(c)
        with venv(c, True):
            c.run('assembl-ini-files populate %s' % (c.config.ini_file))
        # Missing part: for local environment only
        # To be separated in a separate function.


def code_root(c, alt_env=None):
    alt_env = alt_env or c
    alt_env = dict(alt_env)
    sanitize_hosts(alt_env)
    if running_locally(c):
        return local_code_root
    else:
        if (as_bool(get_prefixed('package_install', alt_env, False))):
            return get_assembl_code_path(alt_env)
        else:
            return get_prefixed('projectpath', alt_env, os.getcwd())


def as_bool(b):
    return str(b).lower() in {"1", "true", "yes", "t", "on"}


def get_prefixed(c, key, alt_env=None, default=None):
    alt_env = alt_env or c
    alt_env = dict(alt_env)
    for prefx in ('', '_', '*'):
        val = alt_env.get(prefx + key, None)
        if val:
            return val
    return default


def sanitize_hosts(c, alt_env=None):
    alt_env = alt_env or c
    alt_env = dict(alt_env)
    if not alt_env.get('hosts', None):
        public_hostname = alt_env.get("public_hostname", "localhost")
        alt_env['hosts'] = [public_hostname]
    elif not isinstance(alt_env['hosts'], list):
        alt_env['hosts'] = alt_env['hosts'].split()


def system_db_user(c):
    if c.config._internal.postgres_db_user:
        return c.config._internal.postgres_db_user
    if c.config._internal.mac:
        return getuser()
    return "postgres"


@task()
def build_doc(c):
    """Build the Sphinx documentation for the backend (and front-end) as well as build GraphQL documentation"""
    # generate_graphql_documentation(c)
    with c.cd(c.config.projectpath):
        c.run('rm -rf doc/autodoc doc/jsdoc')
        with venv(c):
            c.run('./assembl/static/js/node_modules/.bin/jsdoc -t ' +
                  './assembl/static/js/node_modules/jsdoc-rst-template/template/ --recurse assembl/static/js/app -d ./doc/jsdoc/')
            c.run('env SPHINX_APIDOC_OPTIONS="members,show-inheritance" sphinx-apidoc -e -f -o doc/autodoc assembl')
            c.run('python2 assembl/scripts/make_er_diagram.py %s -o doc/er_diagram' % (c.ini_files))
            c.run('sphinx-build doc assembl/static/techdocs')


@task()
def create_clean_cronlist(c):
    """
    Start with a clean cron list on a machine, or migrate by adding email at top
    """
    from .sudoer import add_cron_job
    admin_email = c.config.admin_email
    if not admin_email:
        add_cron_job(c, '', force_clean=True)
    else:
        email_command = "MAILTO=%s" % (admin_email)
        add_cron_job(c, email_command, force_clean=True, head=True)


def get_upload_dir(c, path=None):
    path = path or c.config.get('upload_root', 'var/uploads')
    if path != '/':
        path = os.path.join(c.config.projectpath, path)
    return path


@task()
def reset_upload_folder(c):
    if c.config._internal.wsginame == 'staging.wsginame':
        # Ensure an uploads folder
        remote_uploads_exists = False
        local_upload_exists = exists(c, get_upload_dir(c))
        with venv(c):
            remote_uploads_exists = c.run('aws s3 ls s3://{}/uploads | wc -l'.format(c.config.aws_bucket_name),
                env={'AWS_ACCESS_KEY_ID': c.config.aws_access_key_id, 'AWS_SECRET_ACCESS_KEY': c.config.aws_secret_access_key})
            remote_uploads_exists = False if exists == '0' else True

        if local_upload_exists and not remote_uploads_exists:
            sync_with_remote_upload_folder(c)
        else:
            sync_with_local_upload_folder(c)


def install_awscli(c):
    with venv(c, True):
        if c.run('which aws', warn=True).failed:
            c.run('pip install awscli')


def _sync_uploads_folder(c, local=False):
    # Sync uploads folder
    install_awscli(c)
    cmd = '{}/var/uploads s3://{}/uploads'.format(c.config.projectpath, c.config.aws_bucket_name)
    if local:
        cmd = 's3://{}/uploads {} --delete'.format(c.config.aws_bucket_name, get_upload_dir(c))
        with venv(c):
            c.run('aws s3 sync %s' % cmd, env={'AWS_ACCESS_KEY_ID': c.config.aws_access_key_id, 'AWS_SECRET_ACCESS_KEY': c.config.aws_secret_access_key})
    else:
        if exists(c, get_upload_dir(c)):
            with venv(c):
                c.run('aws s3 cp %s' % cmd, env={'AWS_ACCESS_KEY_ID': c.config.aws_access_key_id, 'AWS_SECRET_ACCESS_KEY': c.config.aws_secret_access_key})
        else:
            print("There is no uploads folder to sync with Amazon S3!")


@task()
def sync_with_remote_upload_folder(c):
    """
    Syncronize the uploads folder on the host with S3 bucket
    """
    _sync_uploads_folder(c)


@task()
def sync_with_local_upload_folder(c):
    """
    Syncronize a remote uploads folder, on S3 bucket, with the local uploads folder
    """
    _sync_uploads_folder(c, local=True)


@task()
def reset_db(c):
    """
    Restore and update the latest database
    """
    # Only for the staging server (for tests)
    if c.config._internal.wsginame == 'staging.wsgi':
        install_awscli(c)
        exists = False
        # Test if the dump exists on the amazon s3 object storage
        with venv(c):
            exists = c.run('aws s3 ls s3://{}/{} | wc -l'.format(c.config.aws_bucket_name, get_db_dump_name()),
                env={'AWS_ACCESS_KEY_ID': c.config.aws_access_key_id, 'AWS_SECRET_ACCESS_KEY': c.config.aws_secret_access_key})
            exists = False if exists == '0' else True

        print('Restore and update the latest database')
        if not exists:
            # If the dump don't exist, we create it
            print('Create a new dump')
            database_dump_aws(c)
            sync_with_remote_upload_folder(c)
        else:
            # Otherwise, we restore the last dump
            print('Restore the last dump')
            database_restore_aws(c)
            sync_with_local_upload_folder(c)

        # Update the dump only when the schema of the database changes
        if not is_db_updated(c):
            print('Update the restored db')
            build.app_db_update(c)
            # Create the updated dump for future tests
            print('Create the updated dump for future tests')
            database_dump_aws(c)


@task()
def database_dump_aws(c):
    """
    Dumps the database on an amazon s3 object storage
    """
    if not exists(c.config.dbdumps_dir):
        c.run('mkdir -m700 %s' % c.config.dbdumps_dir)

    install_awscli(c)
    with c.cd(c.config.projectpath):
        dump_name = get_versioned_db_dump_name(c)
        dump_path = os.path.join(c.config.dbdumps_dir, dump_name)
        # Create the db dump
        c.run('pg_dump --host={} -U{} --format=custom -b {} > {}'.format(
            c.config.db_host,
            c.config.db_user,
            c.config.db_database,
            dump_path),
            env={'PGPASSWORD': c.config.db_password})
        # Copy the created dump in the aws bucket
        with venv(c):
            c.run('aws s3 cp {} s3://{}/{} '.format(
                dump_path,
                c.config.aws_bucket_name,
                dump_name),
                env={'AWS_ACCESS_KEY_ID': c.config.aws_access_key_id, 'AWS_SECRET_ACCESS_KEY': c.config.aws_secret_access_key})
            # Add a copy as a symbolic link
            c.run('aws s3 cp {} s3://{}/{} '.format(
                dump_path,
                c.config.aws_bucket_name,
                get_db_dump_name()),
                env={'AWS_ACCESS_KEY_ID': c.config.aws_access_key_id, 'AWS_SECRET_ACCESS_KEY': c.config.aws_secret_access_key})
        # Remove the created dump from the local host
        c.run('rm -f {}'.format(dump_path))


@task()
def database_restore_aws(c, backup=False):
    """
    Restores the database backed up on the amazon s3 object storage
    """
    install_awscli(c)
    # if not backup:
    #     assert(env.wsginame in ('staging.wsgi', 'dev.wsgi'))
    #     processes = filter_autostart_processes(_processes_to_restart_without_backup)
    # else:
    #     processes = filter_autostart_processes(_processes_to_restart_with_backup)

    if(c.config._internal.wsginame != 'dev.wsgi'):
        webservers_stop(c)
        # processes.append("prod:uwsgi")  # possibly not autostarted

    # for process in processes:
    #     supervisor_process_stop(process)
    supervisor_shutdown(c)

    # Kill postgres processes in order to be able to drop tables
    # execute(postgres_user_detach)

    # Drop db
    dropped = c.run('dropdb --host={} --username={} --no-password {}'.format(
        c.config.db_host,
        c.config.db_user,
        c.config.db_database), warn=True,
        env={'PGPASSWORD': c.config.db_password})

    assert dropped.succeeded or "does not exist" in dropped, \
        "Could not drop the database"

    # Create db
    build.database_create(c)
    # Restore data
    with c.cd(env.projectpath):
        filename = remote_db_path()
        # Download the latest dump from the amazon s3 object storage
        with venv(c):
            c.run('aws s3 cp s3://{}/{} {}'.format(
                c.config.aws_bucket_name,
                get_db_dump_name(),
                filename),
                env={'AWS_ACCESS_KEY_ID': c.config.aws_access_key_id, 'AWS_SECRET_ACCESS_KEY': c.config.aws_secret_access_key})
        # Restore the downloaded dump
        c.run('pg_restore --no-owner --role={} --host={} --dbname={} -U{} --schema=public {}'.format(
            c.config.db_user,
            c.config.db_host,
            c.config.db_database,
            c.config.db_user,
            filename), env={'PGPASSWORD': c.config.db_password}
        )
        # Remove the downloaded dump from the local host
        c.run('rm -f {}'.format(filename))

    # for process in processes:
    #     supervisor_process_start(process)

    with venv(c):
        c.run('supervisord')
    # if(env.wsginame != 'dev.wsgi'):
    #     execute(webservers_start)


def get_db_dump_name():
    return 'assembl-backup.pgdump'


def is_db_updated(c):
    """
    Return if the database is update or not
    """
    with venv(c):
        history = c.run('alembic -c {} history'.format(c.config._internal.ini_file))
        current = c.run('alembic -c {} heads'.format(c.config._internal.ini_file))
        return current in history


def get_versioned_db_dump_name(c):
    with venv(c):
        current_version = c.run('python -c "import pkg_resources; print pkg_resources.require(\'assembl\')[0].version"')
    return 'db_{}_{}.sql.pgdump'.format(c.config._internal.wsginame, current_version or strftime('%Y%m%d'))


@task()
def install_url_metadata_wheel(c):
    "Install url_metadata in venv3 as a wheel."
    # Temporary, until we have our own wheelhouse
    with venv_py3(c):
        c.run('pip install -U https://github.com/assembl/url_metadata/releases/download/0.0.1/url_metadata-0.0.1-py3-none-any.whl')


@task()
def setup_nginx_file(c):
    c.sudo('ln -s %s/var/share/assembl.nginx /etc/nginx/sites-available/assembl.nginx' % c.config.projectpath)


@task()
def bootstrap_from_wheel(c):
    """
    The de-facto way to bootstrap the dev-staging server in a CI/CD context
    """

    # The database changes/alterations no longer should happen in the assembl instance
    # The elasticsearch reindexing is a cluster migration, should happen with database
    # independent of a single instance

    # File permissions are redundant under AWS conditions (using roles instead)
    # URL metadata changes are independent now
    app_setup(c)
    build.check_and_create_database_user(c)
    build.set_file_permissions(c)
    reset_upload_folder(c)
    reset_db(c)
    reindex_elasticsearch(c)
    install_url_metadata_wheel(c)
    setup_nginx_file(c)


@task()
def generate_dh_group(c):
    """Generate Diffie-Hellman Group"""
    c.sudo("openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048")


# avoid it being defined in both modules
delete_foreign_tasks(locals())
