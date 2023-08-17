# Playdeck Integration

Your game runs in an iFrame inside our Wrapper.
The process of passing data between your game and our Wrapper is via `window.postMessage`.
[Window: postMessage() docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

> Your game can both transmit messages and listen to them.

### FAQ
----
Q: How do I know that my game is running inside telegram?

A: In case of iframe launch there is no way to detect it, but we pass `telegram=true` query parameter into every game url so you can check it and find out telegram startup

----

Q: How to determine exact response within multiple `getData()` calls ?

A: Each `getData()` response contains `key` field according to requested data `key` 

----

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

#### In the following example, data transfer options and method calls are considered in our Wrapper.

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

  /** Whether or not the bottom menu is open. Use to disable the game while a user is in the menu. @return {"playdeck": { "method": "isOpen", "value": boolean}}  */
  getPlaydeckState: () => boolean

  /** Set Loader Progress.
   * - Use `loading(pct)`, to customize the bottom progress bar, pct in % [0..100]. Use this if you have a loader.
   * - **OR**
   * - Use `loading()` to start the animation from 0% to 80% and then wait
   * - Use `loading(100)` when all your assets have been downloaded to make the Play button available.
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

  /** Set Data - use to save arbitrary data in between sessions.
   * @param {string} data - value
   * @param {string} key - key name */
  setData: (key: string, data: string) => void

  /** Get Data - use to obtain saved data.
   * @param {string} key - key name @return `{"playdeck":{"method":"getData", "value": {}}}` **OR** `{"playdeck":{"method": "getData", "value": "value", "key": "key"}}` */
  getData: (key: string) => Object
```

> Obviously, you can't call the method directly. We have saved the logic of constructing data for messages.
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

## Every method usage examples

`getUser: () => Object`
```javascript
// To get user data, you must first request this data
// via postMessage from our integration environment.
const { parent } = window;
parent.postMessage({ playdeck: { method: "getUser" } }, "*");


// Then, to get this data, you need to create an event handler.
window.addEventListener("message", ({ data }) => {
  const { playdeck } = data;
  // All the data that our integration environment
  // passes is in an object whose key will be playdeck.
  if (!playdeck) return;

  // The `method` field stores a value that indicates
  // what the integration environment is responding to.
  if (playdeck.method === "getUser") {
    // In this block, we can read data from the `value` field.
    window.playdeckUser = playdeck.value;
  }
})
```

`gameEnd: () => void`
```javascript
// This method is sent unilaterally only to our integration environment.
// It signals to our integration environment that the game has been over.
// After that we demonstrate the popup.

const { parent } = window;
parent.postMessage({ playdeck: { method: "gameEnd" } }, "*");
```

`loading: (pct: number | undefined) => void`
```javascript
// This method is sent unilaterally only to our integration environment.
// Causes our integration environment to display the download percentage of your game.
// Accepts values from 0 to 100 as a percentage. If you do not pass a value when calling at all,
// then the method will automatically simulate loading up to 80%.
// In order for the progressbar to become a Play button, you need to pass the value 100.

const { parent } = window;

// We call the loading method without passing a value
// so that the integration environment starts displaying the loading process
parent.postMessage({ playdeck: { method: "loading" } }, "*");
// Artificially slow down the download completion call by 1 second
setTimeout(() => {
  parent.postMessage({ playdeck: { method: "loading", value: 100 } }, "*");
}, 1000);
```

`getPlaydeckState: () => boolean`
```javascript
// This method will return you information about
// whether our integration environment overlay is currently open.

const { parent } = window;
parent.postMessage({ playdeck: { method: "getPlaydeckState" } }, "*");

window.addEventListener("message", ({ data }) => {
  const { playdeck } = data;
  if (!playdeck) return;

  if (playdeck.method === "getPlaydeckState") {
    window.isPlayDeckOpened = playdeck.value; // `value` === true or false;
  }
})

```

`getUserLocale: () => Object`
```javascript
// This method will query our integration framework for information about the user's locale.

const { parent } = window;
parent.postMessage({ playdeck: { method: "getUserLocale" } }, "*");

window.addEventListener("message", ({ data }) => {
  const { playdeck } = data;
  if (!playdeck) return;

  if (playdeck.method === "getUserLocale") {
    window.userLocale = playdeck.value;
  }
})
```

`setScore: (score: number, force: boolean = false) => void`
```javascript
// This method will allow you to store progress data. For this we use our internal database.
// To get previously saved data, use the `getScore` method.
// The method works one-way and does not require reading the response.
// Set `force` flag to `true` if the high score is allowed to decrease.
// This can be useful when fixing mistakes or banning cheaters

const { parent } = window;

parent.postMessage(
  { playdeck:
    {
      method: "setScore",
      value: "score",
      isForce: false,
    }
  }
, "*");
```

`getScore: () => Object`
```javascript
// This method allows you to read a previously saved count value.
// Use the `setScore` method to store the score.

const { parent } = window;
parent.postMessage({ playdeck: { method: "getScore" } }, "*");

window.addEventListener("message", ({ data }) => {
  const { playdeck } = data;
  if (!playdeck) return;

  if (playdeck.method === "getScore") {
    window.playdeckScore = playdeck.value;
  }
})
```
`setData: (key: string, data: string) => void`
```javascript
// This method will allow you to store any data you may need.
// Difference from the `setScore` method is that we use the cloud for `setData`.
// Data is saved by key. To retrieve previously saved data, use the `getData` method.

const { parent } = window;

parent.postMessage(
  { playdeck:
    {
      method: "setData",
      key: key,
      value: yourData,
    }
  }
, "*");
```
`getData: (key: string) => Object`
```javascript
// This method allows you to read previously written data by key.
// Use the `setData` method to save the data.

const { parent } = window;
parent.postMessage({ playdeck: { method: "getData", key: key } }, "*");

window.addEventListener("message", ({ data }) => {
  const { playdeck } = data;
  if (!playdeck) return;

  if (playdeck.method === "getData") {
    if (playdeck.key === "x") {
      window.customData = playdeck.value;
    } else {
      window.anotherCustomData = playdeck.value;
    }
  }
})
```
