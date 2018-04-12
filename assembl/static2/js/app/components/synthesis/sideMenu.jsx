// @flow
import React from 'react';
import { Translate } from 'react-redux-i18n';
import { getChildren } from '../../utils/tree';
import { getDiscussionSlug } from '../../utils/globalFunctions';
import SideMenuTree from './sideMenuTree';

import type { SynthesisIdea } from './IdeaSynthesis';

type SideMenuProps = {
  rootIdeas: Array<SynthesisIdea>,
  descendants: Array<SynthesisIdea>,
  synthesisPostId: string,
  ideaOnScroll?: string
};

const SideMenu = (props: SideMenuProps) => {
  const { rootIdeas, descendants, synthesisPostId, ideaOnScroll } = props;
  const slug = getDiscussionSlug();
  return (
    <div className="synthesis-side-menu">
      <Translate value="synthesis.tableOfContents" className="dark-title-4" />
      <div className="title-hyphen block">&nbsp;</div>
      {rootIdeas.map((rootIdea, index) => (
        <SideMenuTree
          ideaOnScroll={ideaOnScroll}
          key={rootIdea.id}
          rootIdea={rootIdea}
          index={index + 1}
          parents={[]}
          subIdeas={getChildren(rootIdea, descendants)}
          slug={slug}
          synthesisPostId={synthesisPostId}
        />
      ))}
    </div>
  );
};

SideMenu.defaultProps = {
  ideaOnScroll: null
};

export default SideMenu;