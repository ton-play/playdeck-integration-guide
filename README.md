# Playdeck Integration

Your game runs in an iFrame inside our Wrapper.
The process of passing data between your game and our Wrapper is via `window.postMessage`.
[Window: postMessage() docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

> Your game can both transmit messages and listen to them.

#### Let's look at an example of listening to messages and processing data from our Wrapper.

```javascript
window.addEventListener("message", ({ data }) => {
  if (!message || !message["playdeck"]) return;

  pdData = data["playdeck"];

  if (pdData.method === "isOpen") {
    window.playdeckIsOpen = data.value;
  }

  if (pdData.method === "play") {
    if (runner.crashed && runner.gameOverPanel) {
      runner.restart();
    } else {
      var e = new KeyboardEvent("keydown", { keyCode: 32, which: 32 });
      document.dispatchEvent(e);
    }
  }

  if (pdData.method === "pause") {
    runner.stop();
  }
});
```

#### By default, "playdeck" sends "{playback: {method: "play"}}" after pressing the play button in the playdeck-menu

#### In the following example, data transfer options are considered, as well as method calls in our Wrapper.

```javascript
const parent = window.parent.window;

const loading = (value) =>
  parent.postMessage({ playdeck: { method: "loading", value: value } }, "*");
const getScore = () =>
  parent.postMessage({ playdeck: { method: "getScore" } }, "*");
loading(100); // It will call the wrapper method, which will start rendering the percentage loading of the progress bar.
```

#### Available Wrapper methods

```javascript
/** Get telegram user id & nickname @return {Object} `{"playdeck": {"method": "getUser", "value": {\"id\":\"74882337\",\"username\":\"Jack\"}}}`*/
  getUser: () => Object

  /** Whether or not the bottom menu is open. Use to disable the game, while user is at the menu. @return {"playdeck": { "method": "isOpen", "value": boolean}}  */
  getPlaydeckState: () => boolean

  /** Set Loader Progress.
   * - Use `loading(pct)`, to customize the bottom progress bar, pct in % [0..100]. Use this if you have a loader.
   * - **OR**
   * - Use `loading()` to start animation from 0% to 80% and then wait
   * - Use `loading(100)` when all your assets has been downloaded, to make Play button available.
   * @param {number | undefined} pct */
  loading: (pct: number | undefined) => void

  /** Call a gameEnd */
  gameEnd: () => void

  /** Get User Locale @returns {"playdeck": {"method": "getUserLocale", "value": string}}*/
  getUserLocale: () => Object

  /**  Set Score @param {number} score @param {boolean} force - set this flag to `true` if the high score is allowed to decrease. This can be useful when fixing mistakes or banning cheaters */
  setScore: (score: number, force: boolean = false) => void

  /**  Get Score from the card @return \{\"playdeck\": {"method":"getScore" , "value": {\"position\":1,\"score\":73}}} **OR** \{"playdeck": {"method":"getScore", value: {"error":{"type":"OBJECT_NOT_FOUND","message":"Game score not found","error":true}}}} */
  getScore: () => Object

  /** Set Data - use to save arbitary data in between sessions.
   * @param {string} data - value
   * @param {string} key - key name */
  setData: (key: string, data: string) => void

  /** Get Data - use to obtain saved data.
   * @param {string} key - key name @return `{"playdeck":{"method":"getData", "value": {}}}` **OR** `{"playdeck":{"method": "getData", "value": {data: "2", key: "numOfGames"}}}` */
  getData: (key: string) => Object
```

> Obviously you can't call the method directly. We have saved the logic of constructing data for messages.
> For example, you want to use the `loading` method. To do this, you need to create an object with 2 fields: `method`, `value`
> Where the value of the `method` field will be the name of the method to be called, and the `value` field will be the loading state data.

#### Message Example

```javascript
const payload = {
  playdeck: {
    method: "loading",
    value: 100,
  },
};

parent.postMessage(payload, "*");
```
