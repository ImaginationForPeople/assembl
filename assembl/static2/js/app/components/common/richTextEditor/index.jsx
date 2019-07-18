// @flow
import * as React from 'react';
import { EditorState, RichUtils } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import createToolbarPlugin from 'draft-js-static-toolbar-plugin';
import { HeadlineThreeButton, HeadlineTwoButton } from 'draft-js-buttons';
// from our workspaces
/* eslint-disable import/no-extraneous-dependencies */
import createAttachmentPlugin from 'draft-js-attachment-plugin';
import createLinkPlugin from 'draft-js-link-plugin';
import createModalPlugin from 'draft-js-modal-plugin';
import punycode from 'punycode';
/* eslint-enable import/no-extraneous-dependencies */
import { BoldButton, ItalicButton, UnorderedListButton } from './buttons';
import { addProtocol } from '../../../utils/linkify';

type DraftPlugin = any;

type Props = {
  editorState: EditorState,
  handleInputFocus?: Function,
  onChange: Function,
  placeholder?: string,
  textareaRef?: Function,
  toolbarPosition: ToolbarPosition,
  withAttachmentButton: boolean,
  withCharacterCounter: number,
  withHeaderButton?: boolean
};

type State = {
  editorHasFocus: boolean,
  toolbarOffset: number
};

export default class RichTextEditor extends React.Component<Props, State> {
  editor: ?Editor;

  toolbarRef: {| current: null | HTMLElement |};

  plugins: Array<DraftPlugin>;

  components: { [string]: React.ComponentType<*> };

  static defaultProps = {
    handleInputFocus: undefined,
    toolbarPosition: 'top',
    withAttachmentButton: false,
    withCharacterCounter: 0,
    withHeaderButton: false
  };

  constructor(props: Props): void {
    super(props);
    this.editor = React.createRef();
    this.toolbarRef = React.createRef();
    const modalPlugin = createModalPlugin();
    const { closeModal, setModalContent, Modal } = modalPlugin;
    const modalConfig = {
      closeModal: closeModal,
      setModalContent: setModalContent
    };
    const linkPlugin = createLinkPlugin({
      ...modalConfig,
      formatLink: addProtocol
    });
    const { LinkButton } = linkPlugin;

    const components = {};
    components.LinkButton = LinkButton;
    components.Modal = Modal;
    let toolbarStructure = [BoldButton, ItalicButton, UnorderedListButton, LinkButton];
    if (props.withHeaderButton) {
      toolbarStructure = [HeadlineTwoButton, HeadlineThreeButton, ...toolbarStructure];
    }
    const plugins = [linkPlugin];

    if (props.withAttachmentButton) {
      const attachmentPlugin = createAttachmentPlugin({
        ...modalConfig
      });
      const { AttachmentButton, Attachments } = attachmentPlugin;
      toolbarStructure.push(AttachmentButton);
      plugins.push(attachmentPlugin);
      components.Attachments = Attachments;
      components.AttachmentButton = AttachmentButton;
    }

    const staticToolbarPlugin = createToolbarPlugin({
      structure: toolbarStructure,
      // we need this for toolbar plugin to add css classes to buttons and toolbar
      theme: {
        buttonStyles: {
          active: 'active',
          button: 'btn btn-default',
          buttonWrapper: 'btn-group'
        },
        toolbarStyles: {
          toolbar: classNames('editor-toolbar', props.toolbarPosition)
        }
      }
    });
    plugins.push(staticToolbarPlugin);

    const { Toolbar } = staticToolbarPlugin;
    this.components = {
      Toolbar: Toolbar,
      ...components
    };
    this.plugins = plugins;

    this.state = {
      editorHasFocus: false,
      toolbarOffset: 0
    };
  }

  componentWillMount() {
    window.addEventListener('scroll', this.setToolbarOffset);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.setToolbarOffset);
  }

  setToolbarOffset = debounce(() => {
    const toolbar = this.toolbarRef.current;
    if (!toolbar) {
      return;
    }
    if (toolbar.offsetTop <= window.pageYOffset) {
      this.setState({ toolbarOffset: window.pageYOffset - toolbar.offsetTop });
    } else {
      this.setState({ toolbarOffset: 0 });
    }
  }, 20);

  handleEditorFocus = () => {
    const { handleInputFocus } = this.props;
    this.setState(
      {
        editorHasFocus: true
      },
      handleInputFocus
    );
  };

  shouldHidePlaceholder(): boolean {
    // don't display placeholder if user changes the block type (to bullet list) before to type anything
    const contentState = this.props.editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (
        contentState
          .getBlockMap()
          .first()
          .getType() !== 'unstyled'
      ) {
        return true;
      }
    }
    return false;
  }

  focusEditor = (): void => {
    // Hacky: Wait to focus the editor so we don't lose selection.
    // The toolbar actions don't work at all without this.
    setTimeout(() => {
      if (this.editor && this.editor.current) {
        this.editor.current.focus();
      }
    }, 50);
  };

  handleReturn = (e: SyntheticKeyboardEvent<*>): 'handled' | 'not-handled' => {
    // Pressing shift-enter keys creates a new line (<br/>) instead of an new paragraph (<p>)
    // See https://github.com/HubSpot/draft-convert/issues/83
    // For example, this enables to create line returns inside a list item.
    const { editorState, onChange } = this.props;
    if (e.shiftKey) {
      onChange(RichUtils.insertSoftNewline(editorState));
      return 'handled';
    }
    return 'not-handled';
  };

  getToolbar() {
    const { Toolbar } = this.components;
    const { toolbarPosition } = this.props;
    if (toolbarPosition === 'top' || toolbarPosition === 'bottom') {
      return <Toolbar />;
    } else if (toolbarPosition === 'sticky') {
      return (
        <div className="editor-toolbar-sticky" style={{ top: this.state.toolbarOffset }}>
          <Toolbar />
        </div>
      );
    }
    return null;
  }

  getCharCount() {
    // https://github.com/draft-js-plugins/draft-js-plugins/blob/master/draft-js-counter-plugin/src/CharCounter/index.js
    const { editorState } = this.props;
    const decodeUnicode = str => punycode.ucs2.decode(str); // func to handle unicode characters
    const plainText = editorState.getCurrentContent().getPlainText('');
    const regex = /(?:\r\n|\r|\n)/g; // new line, carriage return, line feed
    const cleanString = plainText.replace(regex, '').trim(); // replace above characters w/ nothing
    return decodeUnicode(cleanString).length;
  }

  getCounter() {
    if (this.props.withCharacterCounter) {
      return (
        <div className="editor-counter">
          {this.getCharCount()} / {this.props.withCharacterCounter}
        </div>
      );
    }
    return null;
  }

  getPlaceholder() {
    const { editorState, placeholder } = this.props;
    return editorState.getCurrentContent().hasText() && placeholder ? (
      <div className="editor-label form-label">{placeholder}</div>
    ) : (
      <div className="editor-label form-label">&nbsp;</div>
    );
  }

  getAttachments() {
    const { Attachments } = this.components;
    return Attachments ? <Attachments /> : null;
  }

  render() {
    const { editorState, onChange, placeholder, textareaRef } = this.props;
    const divClassName = classNames('rich-text-editor', { hidePlaceholder: this.shouldHidePlaceholder() });
    const { Modal } = this.components;

    return (
      <div ref={this.toolbarRef}>
        <div className={divClassName} ref={textareaRef}>
          <div className="editor-header">
            {this.getPlaceholder()}
            <div className="clear" />
          </div>
          <Modal />
          <div onClick={this.focusEditor}>
            <Editor
              editorState={editorState}
              onChange={onChange}
              onFocus={this.handleEditorFocus}
              placeholder={placeholder}
              plugins={this.plugins}
              ref={this.editor}
              handleReturn={this.handleReturn}
              spellCheck
            />
          </div>
          {/*
          we have to move toolbar in css for now since there is a bug in draft-js-plugin
          It should be fixed in draft-js-plugin v3
         */}
          {this.getToolbar()}
          {this.getAttachments()}
          {this.getCounter()}
        </div>
      </div>
    );
  }
}