var csInterface = new CSInterface();
loadUniversalJSXLibraries();
loadJSX(csInterface.hostEnvironment.appName + '/host.jsx');
window.Event = new Vue();

Vue.component('protodebug', {
  template: `
    <div class="appGrid" @mouseover="wakeApp" @mouseout="sleepApp">
      <event-manager />
      <stylizer />
      <screen>
        <top>
          <window-size v-if="showSize" />
          <stats v-if="showUser">
            <mouse-stats />
            <key-stats />
            <user-stats />
          </stats>
          <sys-info v-if="showSystem" />
        </top>
        <bottom v-if="showDebug">
          <scribe name="debug.write" version="listener" />
          <scribe name="debug.write" version="sender" />
        </bottom>
      </screen>
    </div>
  `,
  data() {
    return {
      showFoot: false,
    }
  },
  computed: {
    showSize: function() { return this.$root.showSize },
    showUser: function () { return this.$root.showUser },
    showSystem: function () { return this.$root.showSystem },
    showDebug: function () { return this.$root.showDebug },
  },
  methods: {
    wakeApp() {
      this.$root.wake();
      Event.$emit('startStats');
    },
    sleepApp() {
      this.$root.sleep();
      Event.$emit('clearStats');
    }
  }
})

Vue.component('screen', { template: `<div class="screen"><slot></slot></div>` })
Vue.component('stats', { template: `<div class="stat-groups"><slot></slot></div>` })
Vue.component('top', { template: `<div class="appTop"><slot></slot></div>` })
Vue.component('bottom', { template: `<div class="appBottom"><slot></slot></div>` })

Vue.component('window-size', {
  template: `
    <div class="window-size">
        <div :class="isWake ? 'window-size-card-active' : 'window-size-card-idle' ">
          <div class="window-size-w">{{panelW}}</div>
          <div class="window-size-x"> x </div>
          <div class="window-size-h">{{panelH}}</div>
        </div>
      </div>
  `,
  computed: {
    isWake: function() { return this.$root.isWake },
    panelW: function() { return this.$root.panelWidth; },
    panelH: function() { return this.$root.panelHeight; },
  },
})

Vue.component('mouse-stats', {
  template: `
    <div class="mouse-statwrap">
      <icon type="cursor"></icon>
      <div class="mouse-statgrid">
        <div v-if="!isWake" class="mouse-pos-idle" style="padding-left:1rem;">Outside</div>
        <div v-if="isWake" :class="isWake ? 'mouse-pos-active' : 'mouse-pos-idle'">{{mouseX}}</div>
        <div v-if="isWake" :class="isWake ? 'mouse-pos-active' : 'mouse-pos-idle'">{{divider}}</div>
        <div v-if="isWake" :class="isWake ? 'mouse-pos-active' : 'mouse-pos-idle'">{{mouseY}}</div>
      </div>
    </div>
  `,
  computed: {
    mouseX: function () { return this.$root.mouseX; },
    mouseY: function () { return this.$root.mouseY; },
    isWake: function () { return this.$root.isWake; },
    divider: function() { return this.$root.isWake ? 'x' : '' }
  },
  methods: {
    clearStats() {
      // 
    },
    getClass() {
      if (this.isWake)
        return 'mouse-pos-active';
      else
        return 'mouse-pos-idle';
    }
  }
})

Vue.component('key-stats', {
  template: `
    <div class="key-statwrap">
      <icon type="key"></icon>
      <div class="key-statgrid">
        <div :class="isWake ? 'key-active' : 'key-idle'">{{lastKey}}</div>
      </div>
    </div>
  `,
  data() {
    return {
      lastKey: 'none',
    }
  },
  computed: {
    isWake: function () { return this.$root.isWake; },
    hasCtrl: function () { return this.$root.Ctrl ? 'Ctrl' : false; },
    hasShift: function () { return this.$root.Shift ? 'Shift' : false; },
    hasAlt: function () { return this.$root.Alt ? 'Alt' : false; },
  },
  mounted() {
    Event.$on('keypress', this.getLastKey);
    Event.$on('clearStats', this.clearStats);
    Event.$on('startStats', this.startStats);
  },
  methods: {
    clearStats() {
      this.lastKey = 'Outside';
    },
    startStats() {
      this.lastKey = 'No keys pressed';
    },
    getLastKey(msg) {
      console.log(`Last key is: ${msg}`);
      if (/Control/.test(msg)) {
        msg = 'Ctrl'
      }
      if (msg !== this.lastKey) {
        if (((this.$root.isDefault) && (msg !== 'Unidentified')) || ((msg == 'Ctrl') || (msg == 'Shift') || (msg == 'Alt'))) {
          if ((msg == 'Ctrl') || (msg == 'Shift') || (msg == 'Alt')) {
            var stack = []
            if (this.hasCtrl)
              stack.push(this.hasCtrl)
            if (this.hasShift)
              stack.push(this.hasShift)
            if (this.hasAlt)
              stack.push(this.hasAlt)

            if (stack.length) {
              console.log('Had length')
              this.lastKey = stack.join('+')
            } else {
              console.log('No length')
              this.lastKey = msg;
            }
          } else {
            this.lastKey = msg;
          }
        } else if (msg == 'Unidentified') {
          this.lastKey = 'Meta'
        } else {
          var stack = []
          if (this.hasCtrl)
            stack.push(this.hasCtrl)
          if (this.hasShift)
            stack.push(this.hasShift)
          if (this.hasAlt)
            stack.push(this.hasAlt)
          stack.push(msg);
          this.lastKey = stack.join('+')
        }
      }
    },
  }
})

Vue.component('user-stats', {
  template: `
    <div class="icon-statwrap">
      <icon type="user"></icon>
      <div class="icon-statgrid">
        <div :class="isWake ? 'text-active' : 'text-idle'">{{lastAction}}</div>
      </div>
    </div>
  `,
  data() {
    return {
      lastAction: 'No action',
    }
  },
  computed: {
    isWake: function () { return this.$root.isWake; },
  },
  mounted() {
    Event.$on('newAction', this.setAction);
    Event.$on('clearStats', this.clearStats);
  },
  methods: {
    clearStats() {
      this.lastAction = 'No action'
    },
    setAction(msg) {
      this.lastAction = msg;
    },
  }
})



Vue.component('sys-info', {
  template: `
    <div class="sys-info">
      <textarea 
        v-if="!isLegacy"
        :class="isWake ? 'system-info-active' : 'system-info-idle'"
        spellcheck="false"
        wrap="off"
        :placeholder="OS"
        rows="2">{{fulldata}}</textarea>
      <div 
        v-if="isLegacy"
        :contenteditable="isWake"
        spellcheck="false"
        :class="isWake ? 'system-info-active' : 'system-info-idle'">
        {{fulldata}}
      </div>
    </div>
  `,
  data() {
    return {
      isLegacy: false,
      info: 'hello',
      infoList: [],
      OS: null,
    }
  },
  computed: {
    isWake: function() { return this.$root.isWake },
    fulldata: function() {
      return this.info.replace(/\r?\n/g, '<br />')
    }
  },
  methods: {
    // getPlaceholder() {
    //   var sys = csInterface.getOSInformation('--user-agent');
    //   return String(sys);
    // },
    setInfo() {
      this.info = this.infoList.join('\r');
    },
    startInfo() {
      this.infoList = [];
      this.OS = csInterface.getOSInformation('--user-agent');
      this.infoList.push(csInterface.getOSInformation('--user-agent'));
      this.infoList.push(`${csInterface.hostEnvironment.appName} ${csInterface.hostEnvironment.appVersion}`);
      this.setInfo();
    }
  },
  mounted() {
    this.startInfo();
  }
})

Vue.component('event-manager', {
  template: `
    <div 
      v-keydown-outside="onKeyDownOutside"
      v-keyup-outside="onKeyUpOutside"
      v-mousemove-outside="onMouseMove"
      v-mouseup-outside="onMouseUp"
      v-mousedown-outside="onMouseDown"
      v-click-outside="onClickOutside">
    </div>
  `,
  data() {
    return {
      activeList: [
        { name: 'Ctrl' },
        { name: 'Shift' },
        { name: 'Alt' },
      ],
      Shift: false,
      Ctrl: false,
      Alt: false,
      wasDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
    }
  },
  mounted() {
    var self = this;
    this.activeMods();
    this.handleResize(null);
    window.addEventListener('resize', this.handleResize);
    csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, self.appThemeChanged);
    this.appThemeChanged();
  },
  computed: {
    mouseX: function () { return this.$root.mouseX; },
    mouseY: function () { return this.$root.mouseY; },
  },
  methods: {
    setPanelCSSHeight() {
      this.$root.setCSS('panel-height', `${this.$root.panelHeight - 20}px`);
    },
    appThemeChanged(event) {
      var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
      console.log('Detected theme change')
      Event.$emit('findTheme', skinInfo);
    },
    handleResize(evt) {
      if (this.$root.activeApp == 'AEFT') {
        // console.log(`w: ${this.panelWidth}, h: ${this.panelHeight}`);
        this.$root.panelWidth = document.documentElement.clientWidth;
        this.$root.panelHeight = document.documentElement.clientHeight;
        // this.setPanelCSSHeight();
        console.log(evt);
      } else {
        this.$root.panelWidth = document.documentElement.clientWidth;
        this.$root.panelHeight = document.documentElement.clientHeight;
        this.setPanelCSSHeight();
      }
    },
    activeMods() {
      var mirror = [], child = {};
      if (this.Ctrl)
        child = { name: 'Ctrl', key: 0 }, mirror.push(child);
      if (this.Shift) {
        child = { name: 'Shift', key: 1 }
        mirror.push(child);
      }
      if (this.Alt) {
        child = { name: 'Alt', key: 2 }
        mirror.push(child);
      }
      this.activeList = mirror;
    },
    clearMods() {
      this.Shift = false, this.Alt = false, this.Ctrl = false;
      this.activeList = [];
    },
    updateMods() {
      this.Ctrl = this.$root.Ctrl, this.Shift = this.$root.Shift, this.Alt = this.$root.Alt;
      this.activeMods();
    },
    onMouseDown(e, el) {
      this.$root.isDragging = true, this.wasDragging = false;
      this.lastMouseX = this.$root.mouseX, this.lastMouseY = this.$root.mouseY;
    },
    onMouseUp(e, el) {
      if (this.$root.isDragging) {
        if (((this.lastMouseX <= this.$root.mouseX + 6) && (this.lastMouseX >= this.$root.mouseX - 6)) && ((this.lastMouseY <= this.$root.mouseY + 6) && (this.lastMouseY >= this.$root.mouseY - 6))) {
          this.wasDragging = false;
        } else {
          Event.$emit('newAction', 'Click/Drag');
          this.wasDragging = true;
          // this.$root.gesture = `Dragged from [${this.lastMouseX}, ${this.lastMouseY}] to [${this.mouseX}, ${this.mouseY}]`
        }
        this.$root.isDragging = false;
      } else {
        // Event.$emit('newAction', 'Drag release');
      }
    },
    onMouseMove(e, el) {
      this.$root.mouseX = e.clientX, this.$root.mouseY = e.clientY;
      if (this.$root.isDragging) {
        Event.$emit('newAction', 'Click-drag')
      } else {
        if (((this.lastMouseX <= this.$root.mouseX + 6) && (this.lastMouseX >= this.$root.mouseX - 6)) && ((this.lastMouseY <= this.$root.mouseY + 6) && (this.lastMouseY >= this.$root.mouseY - 6)))
          console.log('Testing')
        else 
          Event.$emit('newAction', 'Mouse move');
      }
      this.$root.parseModifiers(e);
    },
    onClickOutside(e, el) {
      if (!this.wasDragging) {
        Event.$emit('newAction', 'Mouse click');
      }
    },
    onKeyDownOutside(e, el) {
      this.$root.parseModifiers(e);
      Event.$emit('keypress', e.key);
      Event.$emit('newAction', 'keyDown');
    },
    onKeyUpOutside(e, el) {
      this.$root.parseModifiers(e);
      Event.$emit('keypress', e.key);
      Event.$emit('newAction', 'keyUp');
    },
  },
  computed: {
    isDefault: function () { return this.$root.isDefault },
  },
})

Vue.component('icon', {
  props: {
    type: String,
  },
  template: `
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
        <title>{{type}}</title>
        <polygon v-if="type == 'cursor'" :style="iconColor" points="13.29 44.41 25.48 32.37 42.51 32.37 13.29 3 13.29 44.41"/>
        <path v-if="type == 'key'" :style="iconColor" d="M42,46H8.05A4,4,0,0,1,4,42V8.05A4,4,0,0,1,8.05,4H42a4,4,0,0,1,4,4.05V42A4,4,0,0,1,42,46ZM29.57,29.11,32.23,37h3.44L27.17,12H23.28L14.82,37h3.32l2.59-7.84ZM21.4,26.59l2.44-7.21c.48-1.51.89-3,1.25-4.51h.08c.37,1.44.74,2.92,1.29,4.55l2.44,7.17Z"/>
        <path v-if="type == 'user'" :style="iconColor" d="M34,16a9,9,0,1,1-9-9A9,9,0,0,1,34,16Zm8.06,25.74-2.41-8.43A8.72,8.72,0,0,0,31.27,27H18.73a8.72,8.72,0,0,0-8.38,6.31L7.94,41.74A2.55,2.55,0,0,0,10.39,45H39.61A2.55,2.55,0,0,0,42.06,41.74Z"/>
        <path v-if="type == 'listener'" :style="iconColor" d="M19,17H9V7H19ZM31,7V17H41V7Zm0,14a6,6,0,0,1-6,6,6,6,0,0,1-6-6V19H9v8a16,16,0,0,0,32,0V19H31Z"/>
        <path v-if="type == 'sender'" :style="iconColor" d="M34.76,22.47h-6.4a1.18,1.18,0,0,1-1.11-1.56L32.57,5.55a.47.47,0,0,0-.81-.45L15.14,26.27a1.22,1.22,0,0,0,1,2h6.36a1.18,1.18,0,0,1,1.11,1.57L18.33,44.45a.48.48,0,0,0,.82.45L35.7,24.45A1.22,1.22,0,0,0,34.76,22.47Z"/>
      </svg>
    </div>
  `,
  computed: {
    iconColor: function() {
      return this.$root.isWake ? `fill: ${this.$root.getCSS('color-icon')}` : `fill: ${this.$root.getCSS('color-text-disabled')}`;
    }
  }
})

Vue.component('scribe', {
  props: {
    version: String,
    name: String,
  },
  template: `
    <div v-if="show" class="texter">
      <icon :type="version" />
      <input 
        ref="input"
        :class="getClass()"
        @keyup.enter="submitTest(msg)" 
        v-model="msg" 
        :placeholder="placeholder"/>
    </div>
  `,
  data() {
    return {
      show: true,
      msg: '',
    }
  },
  methods: {
    getClass() {
      return this.isWake ? 'texter-active' : 'texter-idle'
    },
    setFocus() {
      this.$nextTick(() => this.$refs.input.focus());
    },
    clearFocus() {
      this.$nextTick(() => this.$refs.input.blur());
    },
    submitTest(msg) {
      if ((msg.length) && (this.version == 'sender')) {
        this.constructEvent();
      }
    },
    clearScribe() {
      this.msg = '';
    },
    dispatchEvent(name, data) {
      var event = new CSEvent(name, 'APPLICATION');
      event.data = data;
      csInterface.dispatchEvent(event);
    },
    setMsg(data) {
      console.log(data)
      this.msg = data.data;
    },
    constructEvent() {
      console.log(`Should be sending ${this.msg}`);
      this.dispatchEvent(this.name, this.msg);
    },
  },
  computed: {
    isWake: function() {
      return this.$root.isWake;
    },
    placeholder: function() {
      return this.name;
    }
  },
  mounted() {
    var self = this;
    if (this.version == 'listener') {
      csInterface.addEventListener(self.name, self.setMsg);
    } else {
      Event.$on('dispatchEvent', self.constructEvent)
    }
  }
})

Vue.component('stylizer', {
  template: `
    <div class="stylizer"></div>
  `,
  data() {
    return {
      cssOrder: [
        'bg', 
        'icon',
        'border',
        'button-hover',
        'button-active',
        'button-disabled',
        'text-active',
        'text-default',
        'text-disabled',
        'input-focus',
        'input-idle',
        'scrollbar',
        'scrollbar-thumb', 
        'scrollbar-thumb-hover',
        'scrollbar-thumb-width',
        'scrollbar-thumb-radius',
      ],
      activeStyle: [],
      styleList: {
        ILST: {
          lightest: ['#f0f0f0','#535353','#dcdcdc','#f9f9f9','#bdbdbd','#e6e6e6','#484848','#484848','#c6c6c6','#ffffff','#ffffff','#fbfbfb','#dcdcdc','#a6a6a6','20px','20px'],
          light: ['#b8b8b8','#404040','#5f5f5f','#dcdcdc','#969696','#b0b0b0','#101010','#101010','#989898','#e3e3e3','#e3e3e3','#c4c4c4','#a8a8a8','#7b7b7b','20px','10px'],
          dark: ['#535353','#c2c2c2','#5f5f5f','#4a4a4a','#404040','#5a5a5a','#d8d8d8','#d5d5d5','#737373','#ffffff','#474747','#4b4b4b','#606060','#747474','20px','10px'],
          darkest: ['#323232','#b7b7b7','#5f5f5f','#292929','#1f1f1f','#393939','#1b1b1b','#a1a1a1','#525252','#fcfcfc','#262626','#2a2a2a','#383838','#525252','20px','10px'],
        },
      }
    }
  },
  mounted() {
    Event.$on('findTheme', this.findTheme);
  },
  methods: {
    assignMaster() {
      for (let [key,value] of Object.entries(this.master)) {
        console.log(`${key} : ${value}`)
      }
    },
    setGradientTheme() {
      console.log('This is an After Effects theme');
      this.$root.setCSS('color-bg', toHex(appSkin.panelBackgroundColor.color));
      this.$root.setCSS('color-scrollbar', toHex(appSkin.panelBackgroundColor.color, -20));
      this.$root.setCSS('color-scrollbar-thumb', toHex(appSkin.panelBackgroundColor.color));
      this.$root.setCSS('color-scrollbar-thumb-hover', toHex(appSkin.panelBackgroundColor.color, 10));
    },
    detectTheme() {
      let app = this.$root.activeApp, theme = this.$root.activeTheme;
      console.log(this.styleList[app][theme])
    },
    assignTheme() {
      let app = this.$root.activeApp, theme = this.$root.activeTheme;
      console.log(this.styleList[app][theme])
      for (var i = 0; i < this.cssOrder.length; i++) {
        let prop = this.cssOrder[i], value = this.styleList[app][theme][i];
        if (!/width|radius/.test(prop)) {
          this.$root.setCSS(`color-${prop}`, value);
        } else {
          // console.log(prop)
          this.$root.setCSS(prop, value);
        }
      }
    },
    getCSSName(str) {
      if (/\_/gm.test(str))
        str = str.replace(/\_/gm, '-');
      return str;
    },
    findTheme(appSkin) {
      if (this.$root.activeApp !== 'AEFT') {
        if (appSkin.panelBackgroundColor.color.red > 230)
          this.$root.activeTheme = 'lightest';
        else if (appSkin.panelBackgroundColor.color.red > 170)
          this.$root.activeTheme = 'light';
        else if (appSkin.panelBackgroundColor.color.red > 80)
          this.$root.activeTheme = 'dark';
        else
          this.$root.activeTheme = 'darkest';
          console.log(`Theme changed to ${this.$root.activeTheme}`);
          this.$root.updateStorage();
      } else {
        this.setGradientTheme();
      }
      this.assignTheme();
    },
  }
})

var app = new Vue({
  el: '#app',
  data: {
    macOS: false,
    panelWidth: 100,
    panelHeight: 200,
    mouseX: 0,
    mouseY: 0,
    isDragging: false,
    persistent: true,
    // storage: window.localStorage,
    activeApp: csInterface.hostEnvironment.appName,
    activeTheme: 'darkest',
    showSize: true,
    showUser: true,
    showSystem: true,
    showDebug: true,
    isWake: false,
    Shift: false,
    Ctrl: false,
    Alt: false,
    context: {
      menu: [
        { id: "refresh", label: "Refresh panel", enabled: true, checkable: false, checked: false, },
        { label: "---" },
        { id: "showSize", label: "Show Size", enabled: true, checkable: true, checked: true, },
        { id: "showUser", label: "Show User", enabled: true, checkable: true, checked: true, },
        { id: "showSystem", label: "Show System", enabled: true, checkable: true, checked: true, },
        { id: "showDebug", label: "Show Debug", enabled: true, checkable: true, checked: true, },
        { label: "---" },
        { id: "about", label: "Go to Homepage", enabled: true, checkable: false, checked: false, },
      ],
    },
  },
  computed: {
    menuString: function () { return JSON.stringify(this.context); },
    isDefault: function () {
      var result = true;
      if ((this.Shift) | (this.Ctrl) | (this.Alt))
        result = false;
      return result;
    },
  },
  mounted() {
    var self = this;
    if (navigator.platform.indexOf('Win') > -1) { this.macOS = false; } else if (navigator.platform.indexOf('Mac') > -1) { this.macOS = true; }
    // this.startStorage();
    this.readStorage();
    this.setContextMenu();
    // this.handleResize(null);
    // window.addEventListener('resize', this.handleResize);
    // csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, self.appThemeChanged);
    // this.appThemeChanged();
    Event.$on('modsUpdate', self.parseModifiers);
    Event.$on('updateStorage', self.updateStorage);
  },
  methods: {
    startStorage(storage) {
      storage.setItem('contextmenu', JSON.stringify(this.context.menu));
      // storage.setItem('persistent', JSON.stringify(false));
    },
    readStorage() {
      var storage = window.localStorage;
      if (!storage.length) {
        console.log('There was no pre-existing session data');
      } else {
        console.log('Detected previous session data');
        this.context.menu = JSON.parse(storage.getItem('contextmenu'));
        console.log(storage)
        this.showSize = JSON.parse(storage.getItem('showSize'));
        this.context.menu[2].checked = this.showSize;
        this.showUser = JSON.parse(storage.getItem('showUser'));
        this.context.menu[3].checked = this.showUser;
        this.showSystem = JSON.parse(storage.getItem('showSystem'));
        this.context.menu[4].checked = this.showSystem;
        this.showDebug = JSON.parse(storage.getItem('showDebug'));
        this.context.menu[5].checked = this.showDebug;
      }
    },
    updateStorage() {
      var storage = window.localStorage, self = this;
      console.log(this.context.menu)
      storage.setItem('contextmenu', JSON.stringify(self.context.menu));
      storage.setItem('persistent', JSON.stringify(self.persistent));
      storage.setItem('showSize', this.showSize);
      storage.setItem('showUser', this.showUser);
      storage.setItem('showSystem', this.showSystem);
      storage.setItem('showDebug', this.showDebug);
      storage.setItem('theme', self.activeTheme);
      console.log(`Updating local storage:
        Persistent: ${this.persistent}
        Theme: ${this.activeTheme}`)
    },
    setContextMenu() {
      var self = this;
      console.log(this.context)
      csInterface.setContextMenuByJSON(self.menuString, self.contextMenuClicked);
      // csInterface.updateContextMenuItem('showSize', true, self.showSize);
      // csInterface.updateContextMenuItem('showUser', true, self.showUser);
      // csInterface.updateContextMenuItem('showSystem', true, self.showSystem);
      // csInterface.updateContextMenuItem('showDebug', true, self.showSystem);
    },
    contextMenuClicked(id) {
      var target = this.findMenuItemById(id), parent = this.findMenuItemById(id, true);
      console.log(`${target} : ${parent}`)
      if (id == "refresh") {
        location.reload();
      } else if (id == 'homepage') {
        console.log('Go to github')
      } else {
        console.log(`tried ${id} with ${this[id]}`)
        this[id] = !this[id];
        console.log(`tried ${id} with ${this[id]}`)
        var target = this.findMenuItemById(id);
        target.checked = this[id];
        console.log(target.checked);
        // csInterface.updateContextMenuItem('showSize', true, self.showSize);
      }
      this.updateStorage();
    },
    findMenuItemById(id, requested=false) {
      var child, parent;
      for (var i = 0; i < this.context.menu.length; i++) {
        for (let [key, value] of Object.entries(this.context.menu[i])) {
          if (key == "menu") {
            parent = this.context.menu[i];
            for (var v = 0; v < value.length; v++) {
              for (let [index, data] of Object.entries(value[v])) {
                if ((index == "id") && (data == id))
                  child = value[v];
              }
            }
          }
          if ((key == "id") && (value == id)) {
            child = this.context.menu[i], parent = 'root';
          }
        }
      }
      return (requested) ? parent : child;
    },
    toggleMenuItemSiblings(parent, exclude, state) {
      if (parent.length) {
        for (var i = 0; i < parent.length; i++) {
          if (parent[i].id !== exclude)
            csInterface.updateContextMenuItem(parent[i].id, true, state);
        }
      }
    },
    // appThemeChanged(event) {
    //   var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
    //   // this.findTheme(skinInfo);
    //   console.log('Detected theme change')
    //   Event.$emit('findTheme', skinInfo);
    // },
    // handleResize(evt) {
    //   if (this.$root.activeApp == 'AEFT') {
    //     // console.log(`w: ${this.panelWidth}, h: ${this.panelHeight}`);
    //     this.panelHeight = document.documentElement.clientHeight;
    //     // this.setPanelCSSHeight();
    //     console.log(evt);
    //   } else {
    //     this.panelWidth = document.documentElement.clientWidth;
    //     this.panelHeight = document.documentElement.clientHeight;
    //     this.setPanelCSSHeight();
    //   }
    // },
    parseModifiers(evt) {
      // console.log(evt)
      var lastMods = [this.Ctrl, this.Shift, this.Alt]
      if (this.isWake) {
        if (((!this.macOS) && (evt.ctrlKey)) || ((this.macOS) && (evt.metaKey))) {
          this.Ctrl = true;
        } else {
          this.Ctrl = false;
        }
        if (evt.shiftKey)
          this.Shift = true;
        else
          this.Shift = false;
        if (evt.altKey) {
          evt.preventDefault();
          this.Alt = true;
        } else {
          this.Alt = false;
        };
        var thisMods = [this.Ctrl, this.Shift, this.Alt]
        // if (!this.isEqualArray(lastMods, thisMods))
          // console.log(`${thisMods} : ${lastMods}`)
        // Event.$emit('updateModsUI');
      } else {
        // Event.$emit('clearMods');
      }
    },
    flushModifiers() {
      this.Ctrl = false;
      this.Shift = false;
      this.Alt = false;
      Event.$emit('clearMods');
    },
    wake() {
      this.isWake = true;
    },
    sleep() {
      this.isWake = false;
      this.flushModifiers();
    },
    
    getCSS(prop) {
      return window.getComputedStyle(document.documentElement).getPropertyValue('--' + prop);
    },
    setCSS(prop, data) {
      document.documentElement.style.setProperty('--' + prop, data);
    },
    isEqualArray(array1, array2) {
      array1 = array1.join().split(','), array2 = array2.join().split(',');
      var errors = 0, result;
      for (var i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i])
          errors++;
      }
      if (errors > 0)
        result = false;
      else
        result = true;
      return result;
    },
    removeEmptyValues(keyList, mirror = []) {
      for (var i = 0; i < keyList.length; i++) {
        var targ = keyList[i];
        if ((/\s/.test(targ)) || (targ.length < 6)) {
          // no action
        } else {
          mirror.push(targ);
        }
      }
      return mirror;
    },
    removeDuplicatesInArray(keyList) {
      try {
        var uniq = keyList
          .map((name) => {
            return { count: 1, name: name }
          })
          .reduce((a, b) => {
            a[b.name] = (a[b.name] || 0) + b.count
            return a
          }, {})
        var sorted = Object.keys(uniq).sort((a, b) => uniq[a] < uniq[b])
      } catch (err) {
        sorted = keyList
      } finally {
        return sorted;
      }
    },
  }
});
