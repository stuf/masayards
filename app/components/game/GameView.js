// @flow
import { ipcRenderer } from 'electron';
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { GameViewHandler } from '../../core/handle-game-view';
import config from '../../config';

class GameView extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    transformerActions: PropTypes.object.isRequired
  };

  componentDidMount() {
    const handler = new GameViewHandler(this.props.transformerActions);
    const webView = Object.assign(document.createElement('webview'), {
      nodeintegration: true,
      plugins: true,
      partition: `persist:${config.partitionName}`,
      src: config.gameUrl
    });

    webView.addEventListener('dom-ready', handler);

    findDOMNode(this.refs.gameViewHolder).appendChild(webView);
  }

  render() {
    return (
      <div className="dbg">
        <div ref="gameViewHolder" id="game-view-holder"></div>
      </div>
    )
  }
}

export default GameView;
