from collections import defaultdict
from datetime import datetime

from sqlalchemy import (
    Column, ForeignKey, Integer, Boolean, String,
    UnicodeText, UniqueConstraint, event, inspect)
from sqlalchemy.sql.expression import case
from sqlalchemy.orm import (
    relationship, backref, subqueryload, joinedload, aliased)
from sqlalchemy.orm.query import Query
from sqlalchemy.orm.collections import attribute_mapped_collection
from sqlalchemy.ext.hybrid import hybrid_method, hybrid_property
from virtuoso.alchemy import CoerceUnicode
import simplejson as json

from . import Base, TombstonableMixin
from ..lib import config
from ..lib.abc import classproperty
from ..auth import CrudPermissions, P_READ, P_ADMIN_DISC, P_SYSADMIN


class Locale(Base):
    """The name of locales. Follows Posix locale conventions: lang(_Script)(_COUNTRY),
    (eg zh_Hant_HK, but script can be elided (eg fr_CA) if only one script for language,
    as per http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
    """
    __tablename__ = "locale"
    id = Column(Integer, primary_key=True)
    locale = Column(String(20), unique=True)
    rtl = Column(Boolean, server_default="0", doc="right-to-left")
    _locale_collection = None
    _locale_collection_byid = None
    _locale_collection_subsets = None
    UNDEFINED = "und"
    NON_LINGUISTIC = "zxx"
    MULTILINGUAL = "mul"

    def __repr__(self):
        return "<Locale %s (%d)>" % (self.locale, self.id or -1)

    def sublocale_of(self, locale_code):
        if isinstance(locale_code, self.__class__):
            locale_code = locale_code.locale
        my_parts = self.locale.split("_")
        parts = locale_code.split("_")
        if len(my_parts) > len(parts):
            return False
        my_parts = my_parts[:len(parts)]
        return my_parts == parts

    def ancestry(self):
        while self:
            yield self
            ancestor = "_".join(self.locale.split("_")[:-1])
            if not ancestor:
                break
            self = self.get_or_create(ancestor)

    @staticmethod
    def decompose_locale(locale):
        parts = locale.split('_')
        for l in range(len(parts), 0, -1):
            yield "_".join(parts[:l])

    @staticmethod
    def common_parts(locname1, locname2):
        loc1 = locname1.split("_")
        loc2 = locname2.split("_")
        for i in range(min(len(loc1), len(loc2))):
            if loc1[i] != loc2[i]:
                break
        else:
            i += 1
        if i:
            return "_".join(loc1[:i])

    @staticmethod
    def len_common_parts(locname1, locname2):
        loc1 = locname1.split("_")
        loc2 = locname2.split("_")
        for i in range(min(len(loc1), len(loc2))):
            if loc1[i] != loc2[i]:
                break
        else:
            i += 1
        return i

    @staticmethod
    def locale_is_machine_translated(locale):
        return '-x-mtfrom-' in locale

    @hybrid_property
    def is_machine_translated(self):
        return self.locale_is_machine_translated(self.locale)

    @is_machine_translated.expression
    def is_machine_translated(cls):
        return cls.locale.like("%-x-mtfrom-%")

    @property
    def machine_translated_from(self):
        l = self.locale.split('-x-mtfrom-', 1)
        if len(l) == 2:
            return l[1]

    @staticmethod
    def extract_base_locale(locale):
        return locale.split('-x-mtfrom-', 1)[0]

    @property
    def base_locale(self):
        return self.extract_base_locale(self.locale)

    @staticmethod
    def extract_root_locale(locale):
        return locale.split('-x-mtfrom-', 1)[0].split('_')[0]

    @property
    def root_locale(self):
        return self.extract_root_locale(self.locale)

    @classproperty
    def locale_collection(cls):
        "A collection of all known locales, as a dictionary of strings->id"
        if cls._locale_collection is None:
            cls._locale_collection = dict(
                cls.default_db.query(cls.locale, cls.id))
        return cls._locale_collection

    @classmethod
    def get_id_of(cls, locale_code):
        return cls.locale_collection.get(locale_code, None)

    @classmethod
    def get_or_create(cls, locale_code, db=None):
        locale_id = cls.get_id_of(locale_code)
        if locale_id:
            return Locale.get(locale_id)
        else:
            db = db or cls.default_db
            l = Locale(locale=locale_code)
            db.add(l)
            db.flush()
            cls.reset_cache()
            return l

    @classmethod
    def reset_cache(cls):
        cls._locale_collection = None
        cls._locale_collection_byid = None
        cls._locale_collection_subsets = None

    @classproperty
    def locale_collection_byid(cls):
        "A collection of all known locales, as a dictionary of id->string"
        if cls._locale_collection_byid is None:
            cls._locale_collection_byid = {
                id: name for (name, id) in cls.locale_collection.iteritems()}
        return cls._locale_collection_byid

    @classproperty
    def locale_collection_subsets(cls):
        "A dictionary giving all the know locale variants for a base locale"
        if cls._locale_collection_subsets is None:
            # This is used often enough to be worth caching
            collections = cls.locale_collection
            collection_subsets = defaultdict(set)
            for locale in collections.iterkeys():
                collection_subsets[cls.extract_root_locale(locale)].add(locale)
            cls._locale_collection_subsets = collection_subsets
        return cls._locale_collection_subsets

    @classproperty
    def UNDEFINED_LOCALEID(cls):
        return cls.locale_collection[cls.UNDEFINED]

    @classproperty
    def NON_LINGUISTIC_LOCALEID(cls):
        return cls.locale_collection[cls.NON_LINGUISTIC]

    crud_permissions = CrudPermissions(P_READ, P_ADMIN_DISC)


@event.listens_for(Locale, 'after_insert', propagate=True)
@event.listens_for(Locale, 'after_delete', propagate=True)
def locale_collection_changed(target, value, oldvalue):
    # Reset the collections
    Locale._locale_collection_subsets = None
    Locale._locale_collection = None
    Locale._locale_collection_byid = None


class LocaleLabel(Base):
    "Allows to obtain the name of locales (in any target locale, incl. itself)"
    __tablename__ = "locale_label"
    __table_args__ = (UniqueConstraint('named_locale_id', 'locale_id_of_label'), )
    id = Column(Integer, primary_key=True)
    named_locale_id = Column(
        Integer, ForeignKey(
            Locale.id, ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False)
    locale_id_of_label = Column(
        Integer, ForeignKey(
            Locale.id, ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False)
    name = Column(CoerceUnicode)

    named_locale = relationship(Locale, foreign_keys=(
            named_locale_id,))
    locale_of_label = relationship(Locale, foreign_keys=(
            locale_id_of_label,))

    @classmethod
    def names_in_locale(cls, locale):
        loc_ids = [loc.id for loc in locale.ancestry()]
        locale_labels = locale.db.query(cls).filter(
            cls.locale_id_of_label.in_(loc_ids)).all()
        by_target = defaultdict(list)
        for ln in locale_labels:
            by_target[ln.locale_id_of_label].append(ln)
        result = dict()
        loc_ids.reverse()
        for loc_id in loc_ids:
            result.update({
                Locale.locale_collection_byid[lname.named_locale_id]: lname.name
                for lname in by_target[loc_id]})
        return result

    @classmethod
    def names_of_locales_in_locale(cls, loc_codes, target_locale):
        locale_ids = [Locale.locale_collection[loc_code] for loc_code in loc_codes]
        target_loc_ids = [loc.id for loc in target_locale.ancestry()]
        locale_labels = target_locale.db.query(cls).filter(
            cls.locale_id_of_label.in_(target_loc_ids),
            cls.named_locale_id.in_(locale_ids)).all()
        by_target = defaultdict(list)
        for ln in locale_labels:
            by_target[ln.locale_id_of_label].append(ln)
        result = dict()
        target_loc_ids.reverse()
        for loc_id in target_loc_ids:
            result.update({
                Locale.locale_collection_byid[lname.named_locale_id]: lname.name
                for lname in by_target[loc_id]})
        return result

    @classmethod
    def names_in_self(cls):
        return {
            Locale.locale_collection_byid[lname.named_locale_id]: lname.name
            for lname in cls.default_db.query(cls).filter(
                cls.locale_id_of_label == cls.named_locale_id)}

    @classmethod
    def load_names(cls):
        from os.path import dirname, join
        db = cls.default_db
        fname = join(dirname(dirname(__file__)),
                     'nlp/data/language-names.json')
        with open(fname) as f:
            names = json.load(f)
        locales = {x[0] for x in names}
        for l in locales:
            db.add(Locale.get_or_create(l))
        db.flush()
        Locale.reset_cache()
        existing = set(db.query(cls.named_locale_id, cls.locale_id_of_label).all())
        c = Locale.locale_collection
        for (lcode, tcode, name) in names:
            l, t = c[lcode], c[tcode]
            if (l, t) not in existing:
                cls.default_db.add(cls(
                    named_locale_id=l, locale_id_of_label=t, name=name))
        db.flush()

    crud_permissions = CrudPermissions(P_READ, P_ADMIN_DISC)


class LangString(Base):
    __tablename__ = "langstring"
    id = Column(Integer, primary_key=True)

    @classmethod
    def subqueryload_option(cls, reln):
        return subqueryload(reln).joinedload(cls.entries)

    @classmethod
    def joinedload_option(cls, reln):
        return joinedload(reln).joinedload(cls.entries)

    @classproperty
    def id_sequence_name(cls):
        return "%s.%s.langstring_idsequence" % (
            config.get("db_schema"), config.get("db_user"))

    def _before_insert(self):
        (id,) = next(iter(self.db.execute(
            "select sequence_next('%s')" % self.id_sequence_name)))
        self.id = id

    def __repr__(self):
        return 'LangString (%d): %s\n' % (
            self.id or -1, "\n".join((repr(x) for x in self.entries)))

    @classmethod
    def create(cls, value, locale=Locale.UNDEFINED):
        ls = cls()
        lse = LangStringEntry(
            langstring=ls, value=value, locale_id=Locale.get_id_of(locale))
        return ls

    @property
    def entries_as_dict(self):
        return {e.locale_id: e for e in self.entries}

    @hybrid_method
    def non_mt_entries(self):
        by_locale_id = Locale.locale_collection_byid
        return [e for e in self.entries
                if not Locale.locale_is_machine_translated(
                    by_locale_id[e.locale_id])]

    @non_mt_entries.expression
    def non_mt_entries(self):
        return self.db.query(LangStringEntry).join(Locale).filter(
            Locale.locale.notlike("%-x-mtfrom-%")).subquery()

    def first_original(self):
        return next(iter(self.non_mt_entries()))

    _EMPTY_ID = None

    @classproperty
    def EMPTY_ID(cls):
        if cls._EMPTY_ID is None:
            from sqlalchemy.sql.expression import func
            id = LangStringEntry.default_db.query(LangStringEntry.id).filter(
                func.length(LangStringEntry.value) == 0).order_by(
                LangStringEntry.langstring_id).first()
            if id:
                cls._EMPTY_ID = id[0]
            else:
                ls = cls()
                cls.default_db.add(ls)
                entry = LangStringEntry(
                    value="", locale_id=Locale.UNDEFINED_LOCALEID,
                    langstring=ls)
                cls.default_db.add(entry)
                cls.default_db.flush()
                cls._EMPTY_ID = ls.id
        return cls._EMPTY_ID

    @classmethod
    def EMPTY(cls, db):
        return cls.get(cls.EMPTY_ID)

    @classmethod
    def reset_cache(cls):
        cls._EMPTY_ID = None

    @property
    def undefined_entry(self):
        und_id = Locale.UNDEFINED_LOCALEID
        for x in self.entries:
            if x.locale_id == und_id:
                return x

    @hybrid_method
    def best_lang_old(self, locales):
        # based on a simple ordered list of locales
        locale_collection = Locale.locale_collection
        locale_collection_subsets = Locale.locale_collection_subsets
        available = self.entries_as_dict
        if len(available) == 0:
            return LangStringEntry.EMPTY
        if len(available) == 1:
            # optimize for common case
            return available[0]
        for locale in locales:
            # is the locale there?
            locale_id = locale_collection.get(locale, None)
            if locale_id and locale_id in available:
                return available[locale_id]
            # is the base locale there?
            root_locale = Locale.extract_root_locale(locale)
            if root_locale not in locales:
                locale_id = locale_collection.get(root_locale, None)
                if locale_id and locale_id in available:
                    return available[locale_id]
            # is another variant there?
            mt_variants = list()
            for sublocale in locale_collection_subsets[root_locale]:
                if sublocale in locales:
                    continue
                if sublocale == root_locale:
                    continue
                if Locale.locale_is_machine_translated(sublocale):
                    mt_variants.append(sublocale)
                    continue
                locale_id = locale_collection.get(sublocale, None)
                if locale_id and locale_id in available:
                    return available
        # We found nothing, look at MT variants.
        for sublocale in mt_variants:
            locale_id = locale_collection.get(sublocale, None)
            if locale_id and locale_id in available:
                return available[locale_id]
        # TODO: Look at other languages in the country?
        # Give up and give nothing, or give first?

    @best_lang_old.expression
    def best_lang_old(self, locales):
        # Construct an expression that will find the best locale according to list.
        scores = {}
        current_score = 1
        locale_collection = Locale.locale_collection
        locale_collection_subsets = Locale.locale_collection_subsets
        for locale in locales:
            # is the locale there?
            locale_id = locale_collection.get(locale, None)
            if locale_id:
                scores[locale_id] = current_score
                current_score += 1
            # is the base locale there?
            root_locale = Locale.extract_root_locale(locale)
            if root_locale not in locales:
                locale_id = locale_collection.get(root_locale, None)
                if locale_id:
                    scores[locale_id] = current_score
                    current_score += 1
            # is another variant there?
            mt_variants = list()
            found = False
            for sublocale in locale_collection_subsets[root_locale]:
                if sublocale in locales:
                    continue
                if sublocale == root_locale:
                    continue
                if Locale.locale_is_machine_translated(sublocale):
                    mt_variants.append(sublocale)
                    continue
                locale_id = locale_collection.get(sublocale, None)
                if locale_id:
                    scores[locale_id] = current_score
                    found = True
            if found:
                current_score += 1
        # Put MT variants as last resort.
        for sublocale in mt_variants:
            locale_id = locale_collection.get(sublocale, None)
            if locale_id:
                scores[locale_id] = current_score
                # Assume each mt variant to have a lower score.
                current_score += 1
        c = case(scores, value=LangStringEntry.locale_id,
                 else_=current_score)
        q = Query(LangStringEntry).order_by(c).limit(1).subquery()
        return aliased(LangStringEntry, q)

    def best_lang(self, user_prefs=None):
        # Get the best langStringEntry among those available using user prefs.
        # 1. Look at available original languages: get corresponding pref.
        # 2. Sort prefs (same order as original list.)
        # 3. take first applicable w/o trans or whose translation is available.
        # 4. if none, look at available translations and repeat.
        # Logic is painful, but most of the time (single original)
        # will be trivial in practice.
        if len(self.entries) == 1:
            return self.entries[0]
        if user_prefs:
            from .auth import UserLanguagePreference
            if not isinstance(user_prefs, dict):
                # Often worth doing upstream
                user_prefs = UserLanguagePreference.user_prefs_as_dict(
                    user_prefs)
            for use_originals in (True, False):
                entries = filter(
                    lambda e: e.is_machine_translated != use_originals,
                    self.entries)
                if not entries:
                    continue
                candidates = []
                entriesByLocale = {}
                for entry in entries:
                    pref = user_prefs.find_locale(
                        Locale.extract_base_locale(entry.locale_code))
                    if pref:
                        candidates.append(pref)
                        entriesByLocale[pref.locale_code] = entry
                if candidates:
                    candidates.sort()
                    entries = list(self.entries)
                    for pref in candidates:
                        if pref.translate_to:
                            target_locale = pref.translate_to_code
                            entries.sort(key=lambda e: -Locale.len_common_parts(
                                target_locale,
                                Locale.extract_base_locale(e.locale_code)))
                            e = entries[0]
                            if Locale.len_common_parts(
                                    target_locale,
                                    Locale.extract_base_locale(e.locale_code)):
                                return e
                        else:
                            return entriesByLocale[pref.locale_code]
        # give up and give first original
        entries = self.non_mt_entries()
        if entries:
            return entries[0]
        # or first entry
        return self.entries[0]

    def best_entry_in_request(self):
        from pyramid.threadlocal import get_current_request
        from pyramid.security import Everyone
        # Very very hackish, but the user_prefs_as_dict call
        # is costly and frequent. Let's cache it in the request.
        # Useful for view_def use.
        req = get_current_request()
        assert req
        if getattr(req, "lang_prefs", 0) is 0:
            user_id = req.authenticated_userid
            if user_id and user_id != Everyone:
                from .auth import User, UserLanguagePreference
                user = User.get(user_id)
                req.lang_prefs = UserLanguagePreference.user_prefs_as_dict(
                    user.language_preference)
            else:
                req.lang_prefs = None
        return self.best_lang(req.lang_prefs)

    def best_entries_in_request_with_originals(self):
        "Give both best and original (for view_def); avoids a roundtrip"
        lang = self.best_entry_in_request()
        if lang.is_machine_translated:
            entries = self.non_mt_entries()
            entries.append(lang)
            return entries
        else:
            return [lang]

    def remove_translations(self):
        for entry in self.entries:
            if entry.locale.is_machine_translated:
                entry.delete()
            else:
                entry.forget_identification()
        if inspect(self).persistent:
            self.db.expire(self, ["entries"])

    # TODO: the permissions should really be those of the owning object. Yikes.
    crud_permissions = CrudPermissions(P_READ, P_READ, P_SYSADMIN)


@event.listens_for(LangString, 'before_insert', propagate=True)
def receive_before_insert(mapper, connection, target):
    target._before_insert()


class LangStringEntry(Base, TombstonableMixin):
    __tablename__ = "langstring_entry"
    __table_args__ = (
        UniqueConstraint("langstring_id", "locale_id", "tombstone_date"),
    )

    def __init__(self, *args, **kwargs):
        """ in the kwargs, you can specify locale info in many ways:
        as a Locale numeric id (locale_id), Locale object (locale)
        or language code (@language)"""
        if "langstring_id" not in kwargs and "langstring" not in kwargs:
            kwargs["langstring"] = LangString()
        if ("locale_id" not in kwargs and "locale" not in kwargs
                and '@language' in kwargs):
            # Create locale on demand.
            locale_code = kwargs.get("@language", "und")
            del kwargs["@language"]
            locale_id = Locale.locale_collection.get(locale_code, None)
            if locale_id is None:
                kwargs["locale"] = Locale(locale=locale_code)
            else:
                kwargs["locale_id"] = locale_id
                kwargs["locale"] = Locale.get(locale_id)
        super(LangStringEntry, self).__init__(*args, **kwargs)

    id = Column(Integer, primary_key=True)
    langstring_id = Column(
        Integer, ForeignKey(LangString.id, ondelete="CASCADE"),
        nullable=False, index=True)
    langstring = relationship(
        LangString, backref=backref("entries", cascade="all, delete-orphan"))
    # Should we allow locale-less LangStringEntry? (for unknown...)
    locale_id = Column(
        Integer, ForeignKey(
            Locale.id, ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False)
    locale = relationship(Locale)
    locale_identification_data = Column(String)
    locale_confirmed = Column(Boolean, server_default="0",
        doc="Locale inferred from discussion agrees with identification_data")
    # tombstone_date = Column(DateTime) implicit from Tombstonable mixin
    value = Column(UnicodeText)  # not searchable inv virtuoso

    def __repr__(self):
        value = self.value or ''
        if len(value) > 50:
            value = value[:50]+'...'
        return '%d: [%s] "%s"' % (
            self.id or -1, self.locale.locale, value.encode('utf-8'))

    @property
    def locale_code(self):
        return Locale.locale_collection_byid.get(self.locale_id, None)
        # Equivalent to the following, which may trigger a DB load
        # return self.locale.locale

    @locale_code.setter
    def locale_code(self, locale_code):
        locale_id = Locale.locale_collection.get(locale_code, None)
        if locale_id:
            self.locale_id = locale_id
            if inspect(self).persistent:
                self.db.expire(self, ["locale"])
            else:
                self.locale = Locale.get(locale_id)
        else:
            self.locale = Locale(locale=locale_code)

    @property
    def locale_identification_data_json(self):
        return json.loads(self.locale_identification_data or "{}")

    @locale_identification_data_json.setter
    def locale_identification_data_json(self, data):
        self.locale_identification_data = json.dumps(data) if data else None

    @property
    def is_machine_translated(self):
        return Locale.locale_is_machine_translated(
            Locale.locale_collection_byid[self.locale_id])

    def change_value(self, new_value):
        self.tombstone = datetime.utcnow()
        new_version = self.__class__(
            langstring_id=self.langstring_id,
            locale_id=self.locale_id,
            value=new_value)
        self.db.add(new_version)
        return new_version

    def identify_locale(self, locale_code, data, certainty=False):
        # A translation service proposes a data identification.
        # the information is deemed confirmed if it fits the initial
        # hypothesis given at LSE creation.
        changed = False
        if self.locale.is_machine_translated:
            raise RuntimeError("Why identify a machine-translated locale?")
        data = data or {}
        original = self.locale_identification_data_json.get("original", None)
        if original and locale_code == original:
            if locale_code != self.locale_code:
                self.locale_code = locale_code
                changed = True
            self.locale_identification_data_json = data
            self.locale_confirmed = True
        elif locale_code != self.locale_code:
            if self.locale_confirmed:
                if certainty:
                    raise RuntimeError("Conflict of certainty")
                # keep the old confirming data
                return False
            # compare data? replacing with new for now.
            if not original and self.locale_identification_data:
                original = Locale.UNDEFINED
            original = original or self.locale_code
            if original != locale_code:
                data["original"] = original
            self.locale_code = locale_code
            changed = True
            self.locale_identification_data_json = data
            self.locale_confirmed = certainty
        else:
            if original and original != locale_code:
                data['original'] = original
            self.locale_identification_data_json = data
            self.locale_confirmed = certainty or locale_code == original
        return changed

    def forget_identification(self):
        if not self.locale_confirmed:
            data = self.locale_identification_data_json
            orig = data.get("original", None)
            if orig and orig != self.locale_code:
                self.locale_code = orig
        self.locale_identification_data = None

    crud_permissions = CrudPermissions(P_READ, P_READ, P_SYSADMIN)


# class TranslationStamp(Base):
#     "For future reference. Not yet created."
#     __tablename__ = "translation_stamp"
#     id = Column(Integer, primary_key=True)
#     source = Column(Integer, ForeignKey(LangStringEntry.id))
#     dest = Column(Integer, ForeignKey(LangStringEntry.id))
#     translator = Column(Integer, ForeignKey(User.id))
#     created = Column(DateTime, server_default="now()")
#     crud_permissions = CrudPermissions(
#          P_TRANSLATE, P_READ, P_SYSADMIN, P_SYSADMIN,
#          P_TRANSLATE, P_TRANSLATE)


def populate_default_locales(db):
    for loc_code in (
            Locale.UNDEFINED, Locale.MULTILINGUAL, Locale.NON_LINGUISTIC):
        Locale.get_or_create(loc_code, db=db)
    LangString.EMPTY_ID


def includeme(config):
    pass
