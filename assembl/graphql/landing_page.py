# -*- coding=utf-8 -*-
import graphene
from graphene.relay import Node
from graphene_sqlalchemy import SQLAlchemyObjectType

from assembl import models
from .langstring import (
    LangStringEntry, resolve_langstring, resolve_langstring_entries)
from .types import SecureObjectType


class LandingPageModuleType(SecureObjectType, SQLAlchemyObjectType):
    class Meta:
        model = models.LandingPageModuleType
        interfaces = (Node, )
        only_fields = ('id', 'default_order', 'editable_order', 'identifier', 'required')

    title = graphene.String(lang=graphene.String())
    title_entries = graphene.List(LangStringEntry)
    helper_img_url = graphene.String()

    def resolve_title(self, args, context, info):
        return resolve_langstring(self.title, args.get('lang'))

    def resolve_title_entries(self, args, context, info):
        return resolve_langstring_entries(self, 'title')


class LandingPageModule(SecureObjectType, SQLAlchemyObjectType):

    class Meta:
        model = models.LandingPageModule
        interfaces = (Node, )
        only_fields = ('id', 'enabled', 'order', 'configuration')

    module_type = graphene.Field(LandingPageModuleType)
    exists_in_database = graphene.Boolean()

    def resolve_exists_in_database(self, args, context, info):
        return self.id > 0

    def resolve_id(self, args, context, info):
        if self.id < 0:
            # this is a temporary object we created manually in resolve_landing_page_modules
            return self.id
        else:
            # this is a SQLAlchemy object
            # we can't use super here, so we just copy/paste resolve_id method from SQLAlchemyObjectType class
            from graphene.relay import is_node
            graphene_type = info.parent_type.graphene_type
            if is_node(graphene_type):
                return self.__mapper__.primary_key_from_instance(self)[0]
            return getattr(self, graphene_type._meta.id, None)
