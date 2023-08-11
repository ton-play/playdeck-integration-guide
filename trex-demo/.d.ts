declare class Playdeck {
  /** 🆔 Get telegram user id & nickname @return {Object} "{\"id\":\"74882337\",\"username\":\"Jack\"}"*/
  getUser: () => Object

  /** 🚦 Whether or not the bottom menu is open. Use to disable the game, while user is at the menu. @return {boolean}  */
  popupIsOpen: () => boolean

  /** 🔋 Set Loader Progress.
   * - Use `loading(pct)`, to customize the bottom progress bar, pct in % [0..100]. Use this if you have a loader.
   * - **OR**
   * - Use `loading()` to start animation from 0% to 95% and then wait
   * - Use `loading(100)` when all your assets has been downloaded, to make Play button available.
   * @param {number | undefined} pct */
  loading: (pct: number | undefined) => void

  /** 📻 Subscribe for game events from playdeck */
  addGameListener: (listener: (event: 'play' | 'pause') => void) => void

  /** 🏁 Call a gameEnd */
  gameEnd: () => void

  /** 🔤 Get User Locale @returns {string} string(2) */
  getUserLocale: () => string

  /** 🎖️ Set Score @param {number} score @param {boolean} force - set this flag to `true` if the high score is allowed to decrease. This can be useful when fixing mistakes or banning cheaters */
  setScore: (score: number, force: boolean = false) => void

  /** 🎖️ Get Score from the card @return \{\"position\":1,\"score\":73} **OR** \{"error":{"type":"OBJECT_NOT_FOUND","message":"Game score not found","error":true}} */
  getScore: () => Object

  /** 💾 Set Data - use to save arbitary data in between sessions.
   * @param {string} data - value
   * @param {string} key - key name */
  setData: (key: string, data: string) => void

  /** 💾 Get Data - use to obtain saved data.
   * @param {string} key - key name @return `{}` **OR** `{data: "2", key: "numOfGames"}` */
  getData: (key: string) => Object
}

declare var playdeck: Playdeck
