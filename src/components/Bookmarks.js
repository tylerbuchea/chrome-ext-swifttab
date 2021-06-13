/*global chrome*/

import React from "react";
import PropTypes from "prop-types";

class Bookmarks extends React.Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
  };

  state = { bookmarks: [] };

  componentDidMount() {
    // Add event listeners
    if (chrome) {
      chrome.bookmarks.onCreated.addListener(this.getBookmarks);
      chrome.bookmarks.onRemoved.addListener(this.getBookmarks);
      chrome.bookmarks.onChanged.addListener(this.getBookmarks);
      chrome.bookmarks.onMoved.addListener(this.getBookmarks);
      chrome.bookmarks.onChildrenReordered.addListener(this.getBookmarks);
    }

    // Get bookmarks
    this.getBookmarks();
  }

  componentWillUnmount() {
    // Remove event listeners
    if (chrome) {
      chrome.bookmarks.onCreated.removeListener(this.getBookmarks);
      chrome.bookmarks.onRemoved.removeListener(this.getBookmarks);
      chrome.bookmarks.onChanged.removeListener(this.getBookmarks);
      chrome.bookmarks.onMoved.removeListener(this.getBookmarks);
      chrome.bookmarks.onChildrenReordered.removeListener(this.getBookmarks);
    }
  }

  getBookmarks = () => {
    // Search bookmarks for folder
    chrome.bookmarks.search(
      {
        url: null,
        title: this.props.folder,
      },
      (results) => {
        // If results, parse bookmarks
        results.length &&
          chrome.bookmarks.getSubTree(results[0].id, (data) =>
            this.setBookmarks(data[0])
          );

        // Fallback to Bookmarks Bar
        !results.length &&
          chrome.bookmarks.getSubTree("1", (data) => {
            this.setBookmarks(data[0]);
          });
      }
    );
  };

  setBookmarks = (folder) => {
    console.log("bookmarks folder: ", folder);

    const filter = (bookmark) => bookmark.title[0] !== "#";
    const bookmarks = folder.children || [];
    const filteredBookmarks = filter ? bookmarks.filter(filter) : bookmarks;
    this.setState({ bookmarks: filteredBookmarks });
  };

  render() {
    return this.props.render(this.state, this.props.folder);
  }
}

export default Bookmarks;
