# Introduction


* [What Is PlayDeck?](#what-is-playdeck)
* [Full Documentation](#full-documentation)
* [Quick Overview](#some-methods-are-mandatory-to-be-implemented)
* [Contact Us](#contact-us)

  

# What Is PlayDeck?

PlayDeck is a Telegram-native gaming marketplace that empowers game developers to showcase their games on one of the fastest-growing social platforms. With PlayDeck toolkit solutions, you can launch Web2 and Web3 games on Telegram and use all the benefits of social and referral mechanics to boost traffic and revenue.

Games in PlayDeck can vary in genre, complexity, and gameplay mechanics. They can range from simple arcade-style games to more intricate multiplayer experiences. PlayDeck games are lightweight and accessible, and users can play them seamlessly within the Telegram app without downloads or installation.

![cover](https://pd-static.playdeck.io/static/doc-cover.jpg)

What Is a Game in PlayDeck?
It is a web-based application inside Telegram.
It can open directly from a Telegram chat, group, or /channel.
It can be shared directly from the game interface.
If you already have a game built on HTML5 or WebGL (Unity, Phaser, PixiJS, BabylonJS, Cocos2d, and others), you can easily adapt it to work on our platform.

# Full Documentation

See the [**Wiki**](https://github.com/ton-play/playdeck-integration-guide/wiki) for full documentation, examples, operational details and other information.

---

# Some methods are mandatory to be implemented:

* [**loading()**](https://github.com/ton-play/playdeck-integration-guide/wiki/Available-methods#loading-pct-number--undefined--void) At the start of the game loading process, it's essential to transmit loading (1), and similarly, at the end when the game has finished loading (100). If the loading progress reaching 100% is not signaled, the Play button within the wrapper won't become active.

* The game should consider to use correct user locale for rendering proper UI texts. You can find locale by calling [**getUserProfile()**](https://github.com/ton-play/playdeck-integration-guide/wiki/Available-methods#getuserprofile---profile) method OR use devices locale in order of prioriry: `(navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;`

* [**setData()/getData()**](https://github.com/ton-play/playdeck-integration-guide/wiki/Available-methods#cloud-save) It can be utilized for cloud saving and cross-device experiences. For example, if your game has levels or your players accumulate some in-game bonuses, you can save and share that information using these methods so that you do not ruin the user experience. This can also be implemented through other methods on the developer side.

---

Inside Playdeck, your game runs in an iFrame in our Wrapper.
The process of passing data between your game and our Wrapper is via `window.postMessage`.
[Window: postMessage() docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

#### Let's look at an example of listening to messages and processing data from our Wrapper.

```javascript
// Creating an event listener playdeck
window.addEventListener('message', ({ data }) => {
  if (!data || !data['playdeck']) return;

  pdData = data['playdeck'];

  // By default, playdeck sends "{ playdeck: { method: "play" }}" after pressing the play button in the playdeck-menu
  if (pdData.method === 'play') { 
    if (runner.crashed && runner.gameOverPanel) {
      runner.restart();
    } else {
      var e = new KeyboardEvent('keydown', { keyCode: 32, which: 32 });
      document.dispatchEvent(e);
    }
  }
  
  // Getting the playdeck-menu status, after using the getPlaydeckState method
  if (pdData.method === 'getPlaydeckState') {
    window.playdeckIsOpen = data.value; // if true, then the playlist is open
  }
});

const { parent } = window

const payload = {
  playdeck: {
  method: 'getPlaydeckState',
  },
};

// calling the method
parent.postMessage(payload, '*');
```

> In your example, we track the event of pressing the "play" button in the playdeck-menu, and also get the result of the [getPlaydeckState](https://github.com/ton-play/playdeck-integration-guide/wiki/Available-methods#getplaydeckstate---boolean) method.
> Obviously, you can't call the method directly. We have saved the logic of constructing data for messages.
> For example, you want to use the [`loading`](https://github.com/ton-play/playdeck-integration-guide/wiki/Available-methods#loading-pct-number--undefined--void) method. To do this, you need to create an object with 2 fields: `method`, `value`
> Where the value of the `method` field will be the name of the method to be called, and the `value` field will be the loading state data.

#### Message Example

```javascript
const payload = {
  playdeck: {
    method: 'loading',
    value: 100,
  },
};

parent.postMessage(payload, '*');
```


You can find usage examples and detailed information on each method in [our guide](https://github.com/ton-play/playdeck-integration-guide/wiki/Available-methods).

# Contact Us

- Telegram bot for Initial contact: [@PlayDeckInfoBot](https://t.me/PlayDeckInfoBot)
- More about PlayDeck: [playdeck.io](https://playdeck.io) 
- Try our game platform: [PlayDeck](https://t.me/playdeckbot)

