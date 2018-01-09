# -*- coding=utf-8 -*-
"""Landing page related models."""
from sqlalchemy import (
    Boolean,
    Column,
    Float,
    Integer,
    String,
    ForeignKey,
)
from sqlalchemy.orm import relationship, backref

from assembl.lib.sqla import Base
from assembl.auth import CrudPermissions, P_SYSADMIN, P_READ
from assembl.lib.sqla_types import URLString
from .langstrings import LangString


module_types = [
    {
        u'identifier': u'HEADER',
        u'title': {
            u'en': u'Header',
            u'fr': u'Bandeau header'
        },
        u'helper_img_url': u'',
        u'default_order': 1.0,
        u'editable_order': False,
        u'required': True
    },
    {
        u'identifier': 'INTRODUCTION',
        u'title': {
            u'en': u'Introduction',
            u'fr': u'Introduction'
        },
        u'helper_img_url': u'',
        u'default_order': 2.0,
        u'editable_order': True,
        u'required': False
    },
    {
        u'identifier': 'TIMELINE',
        u'title': {
            u'en': u'Timeline',
            u'fr': u'Timeline'
        },
        u'helper_img_url': u'',
        u'default_order': 3.0,
        u'editable_order': True,
        u'required': True
    },
    {
        u'identifier': 'FOOTER',
        u'title': {
            u'en': u'Footer',
            u'fr': u'Footer'
        },
        u'helper_img_url': u'',
        u'default_order': 99.0,
        u'editable_order': False,
        u'required': True
    },
    {
        u'identifier': 'TOP_THEMATICS',
        u'title': {
            u'en': u'Top thematics',
            u'fr': u'Thématiques à la une'
        },
        u'helper_img_url': u'',
        u'default_order': 4.0
    },
    {
        u'identifier': 'TWEETS',
        u'title': {
            u'en': u'Tweets',
            u'fr': u'Tweets'
        },
        u'helper_img_url': u'',
        u'default_order': 5.0
    },
    {
        u'identifier': 'VIDEO',
        u'title': {
            u'en': u'Video',
            u'fr': u'Vidéo'
        },
        u'helper_img_url': u'',
        u'default_order': 6.0
    },
    {
        u'identifier': 'CHATBOT',
        u'title': {
            u'en': u'Chatbot',
            u'fr': u'Chatbot'
        },
        u'helper_img_url': u'',
        u'default_order': 7.0
    },
    {
        u'identifier': 'CONTACT',
        u'title': {
            u'en': u'Contact',
            u'fr': u'Contact'
        },
        u'helper_img_url': u'',
        u'default_order': 8.0
    },
    {
        u'identifier': 'NEWS',
        u'title': {
            u'en': u'News',
            u'fr': u'Actualités à la une'
        },
        u'helper_img_url': u'',
        u'default_order': 9.0
    },
    {
        u'identifier': 'DATA',
        u'title': {
            u'en': u'Data',
            u'fr': u'Module bandeau Data'
        },
        u'helper_img_url': u'',
        u'default_order': 10.0
    },
]


class LandingPageModuleType(Base):

    """Landing page module type."""

    __tablename__ = "landing_page_module_type"
    type = Column(String(60), nullable=False)

    id = Column(Integer, primary_key=True)

    identifier = Column(String(30), nullable=False)

    title_id = Column(
        Integer(), ForeignKey(LangString.id))
    title = relationship(
        LangString,
        lazy="joined", single_parent=True,
        primaryjoin=title_id == LangString.id,
        backref=backref("landing_page_module_type_from_title", lazy="dynamic"),
        cascade="all, delete-orphan")

    helper_img_url = Column(URLString)

    default_order = Column(Float, nullable=False)

    editable_order = Column(Boolean, default=True)

    required = Column(Boolean, default=False)

    __mapper_args__ = {
        'polymorphic_identity': 'landing_page_module_type',
        'polymorphic_on': type,
        'with_polymorphic': '*'
    }

    crud_permissions = CrudPermissions(P_SYSADMIN, P_READ, P_SYSADMIN, P_SYSADMIN)

    @classmethod
    def populate_db(cls, db=None):
        db.execute("lock table %s in exclusive mode" % cls.__table__.name)
        current_module_types = [item[0] for item in db.query(cls.identifier).all()]
        for info in module_types:
            if info['identifier'] not in current_module_types:
                args = info
                title = None
                for locale, value in info[u'title'].iteritems():
                    if title:
                        title.add_value(value, locale)

                    title = LangString.create(value, locale)

                args['title'] = title
                saobj = LandingPageModuleType(**args)
                db.add(saobj)


LangString.setup_ownership_load_event(LandingPageModuleType, ['title'])
