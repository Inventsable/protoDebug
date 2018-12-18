// Query notification with custom message retrieved via HTML
// Build protoDebug, disable original and test debug.fetch in production build
// Ensure template is up-to-date with protoBrowser
// Check viability of iframe address retreival via postMessage
// Find a way to open new window in default browser

// 

// Check viability of appending second extension to ALL extensions, acting as solo debug or notification hub

var csInterface = new CSInterface();
loadUniversalJSXLibraries();
loadJSX(csInterface.hostEnvironment.appName + '/host.jsx');
window.Event = new Vue();

csInterface.addEventListener('console', function (evt) { Event.$emit('console.log', JSON.stringify(evt)); });
csInterface.addEventListener('debug.bounce', function(evt) { console.log(evt.data); });
csInterface.addEventListener('debug.link', function(evt) { Event.$emit('debug.start', evt); });
csInterface.addEventListener('debug.target', function (evt) { Event.$emit('debug.target', evt); });
csInterface.addEventListener('debug.unlink', function(evt) { Event.$emit('requestUnlink', evt); });
csInterface.addEventListener('debug.fetch', function(evt) { 
  console.log('Was caught')
  Event.$emit('fetch', evt); 
});
csInterface.addEventListener('debug.listen', function (evt) {
  console.log('Caught global listener')
  var clone = JSON.parse(evt.data);
  Event.$emit('updateClone', clone);
});

// Overring wake/sleep state to wake only
Vue.component('protodebug', {
  template: `
    <div class="appGrid" @mouseover="wakeApp" @mouseout="sleepApp">
      <event-manager />
      <stylizer />
      <screen>
        <top>
          <notification v-if="hasNotification" :model="notification" />
          <window-size v-if="showSize" />
          <link-data v-if="showUser"/>
          <stats v-if="showUser">
            <mouse-stats />
            <key-stats />
            <user-stats />
          </stats>
          <sys-info v-if="showSystem" />
          <console-info v-if="showConsole" />
        </top>
        <bottom v-if="showDebug" />
      </screen>
    </div>
  `,
  data() {
    return {
      hasNotification: false,
      wakeOnly: true,
      showFoot: false,
      notification: {
        data: 'test update',
        details: '',
        notes: [
          "dummy text 1",
          "dummy text 2",
          "dummy text 3"
        ],
        preview: 'https://via.placeholder.com/960x540/434343/b7b7b7',
      }
    }
  },
  computed: {
    showSize: function() { return this.$root.showSize },
    showUser: function () { return this.$root.showUser },
    showSystem: function () { return this.$root.showSystem },
    showConsole: function () { return this.$root.showConsole },
    showDebug: function () { return this.$root.showDebug },
  },
  methods: {
    wakeApp() {
      this.$root.wake();
      Event.$emit('startStats');
    },
    sleepApp() {
      if (this.wakeOnly) {
        this.wakeApp();
        Event.$emit('clearStats');
      } else {
        this.$root.sleep();
        Event.$emit('clearStats');
      }
    },
    showNotification() {
      console.log('show notify')
      if (this.$root.notificationsEnabled) {
        this.hasNotification = true;
      }
    },
    hideNotification() {
      console.log('hide notify')
      this.$root.notificationsEnabled = false;
      this.hasNotification = false;
    },
    constructUpdate(msg) {
      this.notification = JSON.parse(msg);
      console.log('constructed message is:')
      console.log(this.notification);
    },
  },
  mounted() {
    Event.$on('showNotification', this.showNotification);
    Event.$on('hideNotification', this.hideNotification);
    Event.$on('promptUpdate', this.constructUpdate);
    // Event.$on('nullifyUpdate', this.nullifyUpdate);
  }
})

Vue.component('notification-icon', {
  props: {
    type: String,
  },
  template: `
    <div 
      :class="type == 'cancel' ? 'note-icon' : 'note-icon'" 
      @mouseover="hover = true" 
      @mouseout="hover = false" 
      @click="doAction"
      v-if="type !== 'none'">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
        <path v-if="type == 'cancel'" :style="iconColor" d="M29.24,25,41.12,13.12a3,3,0,0,0-4.24-4.24L25,20.76,13.12,8.88a3,3,0,0,0-4.24,4.24L20.76,25,8.88,36.88a3,3,0,0,0,0,4.24,3,3,0,0,0,4.24,0L25,29.24,36.88,41.12a3,3,0,0,0,4.24,0,3,3,0,0,0,0-4.24Z"/>
        <path v-if="type == 'arrowRight'" :style="iconColor" d="M18,42a3,3,0,0,1-2.12-.88,3,3,0,0,1,0-4.24L27.76,25,15.88,13.12a3,3,0,0,1,4.24-4.24l14,14a3,3,0,0,1,0,4.24l-14,14A3,3,0,0,1,18,42Z"/>
        <path v-if="type == 'arrowUp'" :style="iconColor" d="M39,35a3,3,0,0,1-2.12-.88L25,22.24,13.12,34.12a3,3,0,1,1-4.24-4.24l14-14a3,3,0,0,1,4.24,0l14,14a3,3,0,0,1,0,4.24A3,3,0,0,1,39,35Z"/>
        <path v-if="type == 'arrowLeft'" :style="iconColor" d="M32,42a3,3,0,0,1-2.12-.88l-14-14a3,3,0,0,1,0-4.24l14-14a3,3,0,1,1,4.24,4.24L22.24,25,34.12,36.88a3,3,0,0,1,0,4.24A3,3,0,0,1,32,42Z"/>
        <path v-if="type == 'arrowDown'" :style="iconColor" d="M25,35a3,3,0,0,1-2.12-.88l-14-14a3,3,0,1,1,4.24-4.24L25,27.76,36.88,15.88a3,3,0,1,1,4.24,4.24l-14,14A3,3,0,0,1,25,35Z"/>
        <path v-if="type == 'menu'" :style="iconColor" d="M40,28H10a3,3,0,0,1,0-6H40a3,3,0,0,1,0,6Zm3-16a3,3,0,0,0-3-3H10a3,3,0,0,0,0,6H40A3,3,0,0,0,43,12Zm0,26a3,3,0,0,0-3-3H10a3,3,0,0,0,0,6H40A3,3,0,0,0,43,38Z"/>
        <path v-if="type == 'info'" :style="iconColor" d="M25,4A21,21,0,1,0,46,25,21,21,0,0,0,25,4Zm0,35a3,3,0,1,1,3-3A3,3,0,0,1,25,39Zm1.52-9h-3L21.91,12.37a3.1,3.1,0,1,1,6.18,0Z"/>
        <path v-if="type == 'home'" :style="iconColor" d="M45.79,26.74l-1.56,1.89a.9.9,0,0,1-1.26.12L26.57,15.17a1.66,1.66,0,0,0-2.14,0L8,28.75a.9.9,0,0,1-1.26-.12L5.21,26.74a.89.89,0,0,1,.12-1.27L23.16,10.71a3.68,3.68,0,0,1,4.65,0l6.54,5.42V10.31a.74.74,0,0,1,.74-.74h3.48a.74.74,0,0,1,.74.74V20.2l6.36,5.27A.89.89,0,0,1,45.79,26.74Zm-12.15-2.3-7.38-5.91a1.23,1.23,0,0,0-1.52,0l-7.38,5.91-5.92,4.73a1.2,1.2,0,0,0-.45.95V40.78a.65.65,0,0,0,.65.65H21a.66.66,0,0,0,.66-.65v-7.9a.65.65,0,0,1,.65-.65H28a.66.66,0,0,1,.66.65v7.9a.65.65,0,0,0,.65.65h9.31a.66.66,0,0,0,.66-.65V29.56a1.23,1.23,0,0,0-.46-1Z"/>
      </svg>
    </div>
  `,
  data() {
    return {
      hover: false,
    }
  },
  computed: {
    iconColor: function () { return (this.$root.isWake) ? `fill: ${this.$root.getCSS('color-note-icon')}` : `fill: ${this.$root.getCSS('color-text-disabled')}`; }
  },
  methods: {
    doAction() {
      // console.log(`Clicked on ${this.type}`)
    }
  }
})

Vue.component('notification', {
  props: {
    model: Object,
  },
  template: `
    <div class="global-notification">
      <div class="global-notification-wrap">
        <div v-if="!alt" class="note-display">
          <notification-icon type="info" />
        </div>
        <div v-if="isLarge" class="note-header">
          <a @click="goToHome" v-if="!hasDetails && !nullified" class="global-notification-text">{{model.data}}</a>
          <a @click="goToHome" v-if="hasDetails && !nullified" class="global-notification-text">{{fulldetails}}</a>
          <span v-if="nullified" class="global-notification-text">No updates</span>
        </div>
        <div class="note-cancel" @click="killNote">
          <notification-icon type="cancel" />
        </div>
      </div>
      <ul v-if="hasDetails && !nullified" class="note-list">
          <li v-for="(item,key) in model.notes" v-if="!isSmall" class="note-list-note">{{item}}</li>
          <notification-icon v-for="(item,key) in model.notes" v-if="isSmall" type="info" :title="item" :key="key" />
      </ul>
      <div v-if="hasDetails && !nullified"" class="note-preview">
        <div @click="goToHome" :style="getPreviewStyle(model.preview)"></div>
      </div>
      <div v-if="!nullified"" class="global-notification-wrap">
        <div class="global-notification-toggle" @click="toggleTray" :style="styleTray()">
          <notification-icon :type="hasDetails ? 'none' : 'arrowDown'" />
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      alt: true,
      hasDetails: false,
      msg: 'Hello notification',
    }
  },
  computed: {
    fulldetails: function() { return `${this.$root.rootName} ${this.model.details}` },
    nullified: function() { return !this.$root.needsUpdate },
    isSmall: function() { return this.$root.isSmall },
    isMedium: function() { return this.$root.isMedium },
    isLarge: function() { return this.$root.isLarge },
    anchorLink: function () { return `https://www.inventsable.cc#${this.$root.rootName}`; },
  },
  methods: {
    goToHome() { cep.util.openURLInDefaultBrowser(this.anchorLink); },
    styleTray() {
      if (this.hasDetails) {
        if (this.isLarge) {
          return `width: calc(100% - 3rem);`;
        } else {
          return `width: 100%;`;
        }
      } else {
        return `width: 100%;`;
      }
    },
    getPreviewStyle(img) { return `cursor:pointer; background-image: url(${img}); background-size: contain; background-repeat: norepeat; background-color: ${this.$root.getCSS('color-note-dark')}`; },
    toggleTray(el) { this.hasDetails = !this.hasDetails; },
    killNote() {
      Event.$emit('hideNotification');
      const targ = this.$root.findMenuItemById('notificationsEnabled');
      targ.checked = false;
      this.$root.setContextMenu();
    },
  },
  mounted() {
    // Event.$on('nullifyUpdate', this.nullifyUpdate);
  }
})

Vue.component('screen', { template: `<div class="screen"><slot></slot></div>` })
Vue.component('stats', { template: `<div class="stat-groups"><slot></slot></div>` })
Vue.component('top', { template: `<div class="appTop"><slot></slot></div>` })
Vue.component('bottom', {
  template: `
    <div class="appBottom">
      <div class="eventlist">
        <scribe v-for="(event, key) in eventList" :key="key" :name="event.name" :version="event.version" />
      </div>
      <div class="footer">
        <scribe-maker />
      </div>
    </div>
  `,
  data() {
    return {
      eventList: []
    }
  },
  methods: {
    rebuildEvents() {
      this.eventList = this.$root.eventList;
    }
  },
  mounted() {
    this.rebuildEvents();
    Event.$on('rebuildEvents', this.rebuildEvents)
  }
})

Vue.component('link-data', {
  template: `
    <div class="link-wrap">
      <div class="link-name" :style="ifLinked()">{{fullmsg}}</div>
    </div>
  `,
  data() {
    return {
      msg: 'Hello link',
      linkName: 'none',
      fullmsg: '',
      hasTarget: false,
      clone: {},
      targetName: '',
    }
  },
  methods: {
    ifLinked() {
      var style = 'color: ';
      if (this.$root.isLinking) {
        style += this.$root.getCSS('color-text-default');

      } else {
        style += this.$root.getCSS('color-text-disabled');
        this.fullmsg = 'Not currently linked';
      }
      return style;
    },
    killLink() {
      // console.log('Stopping link');
      this.$root.setCSS('color-debug', 'transparent');
      this.$root.isLinking = false;
      this.fullmsg = 'Live debug disabled'
      this.$root.dispatchEvent('debug.off', 'Test message')
      console.log('Turn master scanning off');
    },
    startLink() {
      this.$root.isLinking = true;
      let style = this.$root.getCSS('color-selection');
      this.$root.setCSS('color-debug', style);
      // this.fullmsg = 'Live debug enabled';
      console.log('Start scanning data');
      this.$root.dispatchEvent('debug.on', 'Test message')
    },
    listenLink(msg) {
      console.log('Received message for link:');
      console.log(msg);
    },
    sendLink() {
      console.log('Attempting to start link');
      // this.$root.dispatchEvent('')
    },
    createLink(name) {
      this.targetName = name;
      this.$root.hasLink = true;
      let style = this.$root.getCSS('color-selection');
      this.$root.setCSS('color-debug', style);
    },
    breakLink() {
      this.$root.hasLink = false;
      this.$root.setCSS('color-debug', 'transparent');
    },
    checkLink() {
      if ((this.$root.isLinking) && (this.$root.hasLink)) {
        console.log('This should break individual link')
        this.breakLink();
        // Event.$emit('breakLink');
      } else if (this.$root.isLinking) {
        console.log('This is scanning with no link')
        // console.log('This should break individual link')
        // this.breakLink();
      } else {
        console.log('This is not scanning or linked')
        // Event.$emit('debug.stop');
      }
    },
    targetLink(targname) {
      console.log(`Target is ${targname}`);
      if (this.$root.isLinking) {
        console.log(this.$root.hasLink);
        if (targname.length) {
          this.createLink(targname);
        }
      }
    },
    checkClone(clone) {
      if ((clone.length) && (clone.name == this.targetName)) {
        console.log(this.$root.hasLink);
        console.log('Checking clone...');
        console.log('Same name')
      }
    },
    updateClone(obj) {
      this.checkClone(obj);
      // this.linkName = obj.name;
      // console.log(this.linkName);
      this.fullmsg = `Syncing with ${obj.name}`
      for (let [key,value] of Object.entries(obj)) {
        if (/mouse|panel|last/.test(key)) {
          console.log(`${key} : ${value}`)
          this.$root[key] = value;
        }
      }

      Event.$emit('reClone');
    },
  },
  computed: {
    isWake: function () { return this.$root.isWake },
    panelW: function () { return this.$root.panelWidth; },
    panelH: function () { return this.$root.panelHeight; },
    mouseX: function () { return this.$root.mouseX; },
    mouseY: function () { return this.$root.mouseY; },
  },
  mounted() {
    Event.$on('requestUnlink', this.checkLink);
    Event.$on('debug.start', this.startLink);
    Event.$on('debug.target', this.targetLink);
    Event.$on('debug.stop', this.killLink);
    Event.$on('updateClone', this.updateClone);
    if (this.$root.isLinking)
      this.fullmsg = 'Live debug enabled';
    else
      this.fullmsg = 'Live debug disabled';
    // Event.$on('debug.listen', this.listenLink);
    // Event.$on('debug.send', this.sendLink);
  }
})

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
        <div v-if="isWake" :class="isWake ? 'mouse-pos-active' : 'mouse-pos-idle'">{{mouseX}}</div>
        <div v-if="isWake" :class="isWake ? 'mouse-pos-active' : 'mouse-pos-idle'">{{divider}}</div>
        <div v-if="isWake" :class="isWake ? 'mouse-pos-active' : 'mouse-pos-idle'">{{mouseY}}</div>
      </div>
    </div>
  `,
  // <div v-if="(!isWake) && (!isLinking)" class="mouse-pos-idle" style="padding-left:1rem;">Outside</div>
  computed: {
    mouseX: function () { return this.$root.mouseX; },
    mouseY: function () { return this.$root.mouseY; },
    isWake: function () { return this.$root.isWake; },
    isLinking: function () { return this.$root.isLinking; },
    divider: function() { return this.$root.isWake ? 'x' : '' }
  },
  methods: {
    reClone() {
      // obj = JSON.parse(obj);
      // this.$root.mouseX = obj.mouseX;
      // this.$root.mouseY = obj.mouseY;
    },
    clearStats() {
      this.$root.mousex = 0;
      this.$root.mouseY = 0;
    },
    getClass() {
      if (this.isWake)
        return 'mouse-pos-active';
      else
        return 'mouse-pos-idle';
    }
  },
  mounted() {
    Event.$on('clearStats', this.clearStats);
    Event.$on('reClone', this.reClone);
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
    Event.$on('reClone', this.reClone);
  },
  methods: {
    reClone(obj) {
      this.lastKey = this.$root.lastKey;
    },
    clearStats() {
      this.lastKey = 'No keys pressed';
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
        this.$root.lastKey = this.lastKey;
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
    Event.$on('reClone', this.reClone);
    Event.$on('clearStats', this.clearStats);
  },
  methods: {
    reClone() {
      this.lastAction = this.$root.lastAction;
    },
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

Vue.component('console-info', {
  template: `
    <div class="console-info">
      <textarea 
        v-if="!isLegacy"
        :class="isWake ? 'console-info-active' : 'console-info-idle'"
        spellcheck="false"
        wrap="on"
        id="mainconsole"
        :placeholder="OS"
        :rows="isLinking ? 8 : 8">{{info}}</textarea>
      <textarea 
        v-if="!isLegacy"
        :class="isWake ? 'console-info-active' : 'console-info-idle'"
        spellcheck="false"
        wrap="off"
        placeholder="extension path"
        rows="1">{{extensionPath}}</textarea>
      <div class="file-stats">
        <textarea 
          v-if="!isLegacy"
          :class="isWake ? 'console-info-active' : 'console-info-idle'"
          spellcheck="false"
          wrap="off"
          placeholder="document path"
          rows="1">{{documentPath}}</textarea>  
        <textarea 
          v-if="!isLegacy"
          :class="isWake ? 'console-info-active' : 'console-info-idle'"
          spellcheck="false"
          wrap="off"
          placeholder="document name"
          rows="1">{{documentName}}</textarea>  
      </div>
    </div>
  `,
  data() {
    return {
      isLegacy: false,
      info: '',
      infoList: [],
      OS: 'console.log()',
      extensionPath: '',
      documentPath: '',
      documentName: '',
    }
  },
  computed: {
    isWake: function () { return this.$root.isWake },
    isLinking: function () { return this.$root.isLinking },
    fulldata: function () {
      return this.info.replace(/\r?\n/g, '<br />')
    }
  },
  methods: {
    setInfo(evt) {
      evt = JSON.parse(evt);
      console.log(evt)
      this.infoList = [];
      this.extensionPath = evt.extensionId;
      var fileInfo = evt.appId.split(',');
      this.documentPath = fileInfo[0];
      this.documentName = fileInfo[1];
      // this.extensionId = /[^/]*$/.exec(evt.extensionId)[0];
      this.info = evt.data;
    },
    fullInfo(msg) {
      this.info = msg.data;
    },
    stringInfo(msg) {
      this.info = ` is ${msg}`;
    }
  },
  mounted() {
    Event.$on('console.log', this.setInfo);
    Event.$on('console.full', this.fullInfo);
    Event.$on('console.string', this.stringInfo);
    var extId = csInterface.getSystemPath(SystemPath.EXTENSION);
    csInterface.evalScript(`setExt('${extId}')`)
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
      this.$root.setCSS('evt-height', `${this.$root.panelHeight - 50}px`);
      this.$root.setCSS('panel-height', `${this.$root.panelHeight - 20}px`);
    },
    appThemeChanged(event) {
      var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
      console.log('Detected theme change')
      Event.$emit('findTheme', skinInfo);
    },
    handleResize(evt) {
      if (this.$root.activeApp == 'AEFT') {
        this.$root.panelWidth = document.documentElement.clientWidth;
        this.$root.panelHeight = document.documentElement.clientHeight;
      } else {
        if (!this.isLinking) {
          this.$root.panelWidth = document.documentElement.clientWidth;
          this.$root.panelHeight = document.documentElement.clientHeight;
          this.setPanelCSSHeight();
        } else {
          // external data
        }
      }
    },
    activeMods() {
      if (!this.isLinking) {
        let mirror = [], child = {};
        if (this.Ctrl)
          child = { name: 'Ctrl', key: 0 }, mirror.push(child);
        if (this.Shift)
          child = { name: 'Shift', key: 1 }, mirror.push(child);
        if (this.Alt)
          child = { name: 'Alt', key: 2 }, mirror.push(child);
        this.activeList = mirror;
      } else {
        // external data
      }
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
      if (!this.$root.isLinking) {
        this.$root.isDragging = true, this.wasDragging = false;
        this.lastMouseX = this.$root.mouseX, this.lastMouseY = this.$root.mouseY;
      } else {
        // External data
      }
    },
    onMouseUp(e, el) {
      if (!this.$root.isLinking) {
        if (this.$root.isDragging) {
          if (((this.lastMouseX <= this.$root.mouseX + 6) && (this.lastMouseX >= this.$root.mouseX - 6)) && ((this.lastMouseY <= this.$root.mouseY + 6) && (this.lastMouseY >= this.$root.mouseY - 6))) {
            this.wasDragging = false;
          } else {
            Event.$emit('newAction', 'Click/Drag');
            this.wasDragging = true;
          }
          this.$root.isDragging = false;
        } else {
          // Event.$emit('newAction', 'Drag release');
        }
      } else {
        // External data
      }
    },
    onMouseMove(e, el) {
      if (!this.$root.isLinking) {
        this.$root.mouseX = e.clientX, this.$root.mouseY = e.clientY;
        if (this.$root.isDragging) {
          Event.$emit('newAction', 'Click-drag')
        } else {
          if (((this.lastMouseX <= this.$root.mouseX + 6) && (this.lastMouseX >= this.$root.mouseX - 6)) && ((this.lastMouseY <= this.$root.mouseY + 6) && (this.lastMouseY >= this.$root.mouseY - 6)))
            var nothing = '';
          else 
            Event.$emit('newAction', 'Mouse move');
        }
        this.$root.parseModifiers(e);
      } else {
        // external data
      }
    },
    onClickOutside(e, el) {
      if (!this.isLinking) {
        if (!this.wasDragging) {
          Event.$emit('newAction', 'Mouse click');
        }
      } else {
        // external data
      }
    },
    onKeyDownOutside(e, el) {
      if (!this.$root.isLinking) {
        this.$root.parseModifiers(e);
        Event.$emit('keypress', e.key);
        Event.$emit('newAction', 'keyDown');
      } else {
        // external data
      }
    },
    onKeyUpOutside(e, el) {
      if (!this.$root.isLinking) {
        this.$root.parseModifiers(e);
        Event.$emit('keypress', e.key);
        Event.$emit('newAction', 'keyUp');
      } else {
        // external data
      }
    },
  },
  computed: {
    isDefault: function () { return this.$root.isDefault },
  },
})

Vue.component('toggle-icon', {
  data() {
    return {
      status: [
        {
          name: 'listener', 
          isActive: true,
        },
        {
          name: 'sender',
          isActive: false,
        },
      ]
    }
  },
  template: `
    <div class="toggleWrap">
      <div v-for="type in status" @click="setActive(type)" :class="checkIfActive(type)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
          <path v-if="type.name == 'listener'" :style="iconColor(type)" d="M19,17H9V7H19ZM31,7V17H41V7Zm0,14a6,6,0,0,1-6,6,6,6,0,0,1-6-6V19H9v8a16,16,0,0,0,32,0V19H31Z"/>
          <path v-if="type.name == 'sender'" :style="iconColor(type)" d="M34.76,22.47h-6.4a1.18,1.18,0,0,1-1.11-1.56L32.57,5.55a.47.47,0,0,0-.81-.45L15.14,26.27a1.22,1.22,0,0,0,1,2h6.36a1.18,1.18,0,0,1,1.11,1.57L18.33,44.45a.48.48,0,0,0,.82.45L35.7,24.45A1.22,1.22,0,0,0,34.76,22.47Z"/>
        </svg>
      </div>
    </div>
  `,
  computed: {
    iconClass: function () {
      return this.$root.isWake ? `toggle-icon-active` : `toggle-icon-idle`;
    }
  },
  mounted() {
    this.findActive();
    Event.$on('toggleScribeType', this.toggleType);
  },
  methods: {
    toggleType() {
      for (var i = 0; i < this.status.length; i++) {
        var target = this.status[i];
        target.isActive = !target.isActive;
      }
    },
    setActive(type) {
      if (!type.isActive) {
        this.clearActive();
        type.isActive = true;
        Event.$emit('activeScribe', type.name);
      }
    },
    clearActive() {
      for (var i = 0; i < this.status.length; i++) {
        var target = this.status[i];
        target.isActive = false;
      }
    },
    findActive() {
      for (var i = 0; i < this.status.length; i++) {
        var target = this.status[i];
        if (target.isActive)
          Event.$emit('activeScribe', target.name);
      }
    },
    iconColor(type) {
      var style = '';
      if (this.$root.isWake) {
        if (type.isActive)
          style = `fill: ${this.$root.getCSS('color-selection')}` 
        else
          style = `fill: ${this.$root.getCSS('color-icon')}` 
      } else {
        style = `fill: ${this.$root.getCSS('color-text-disabled')}`;
      } 
      return style;
    },
    checkIfActive(type) {
      if (type.isActive) {
        return 'toggle-icon-active'
      } else {
        return 'toggle-icon-idle'
      }
    },
  }
})

Vue.component('icon', {
  props: {
    type: String,
    parent: String,
    which: String,
    canceller: String,
  },
  template: `
    <div 
      :class="type == 'cancel' ? 'icon-cancel' : 'icon'" 
      @mouseover="hover = true" 
      @mouseout="hover = false" 
      @click="deleteScribe">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
        <title>{{type}}</title>
        <polygon v-if="type == 'cursor'" :style="iconColor" points="13.29 44.41 25.48 32.37 42.51 32.37 13.29 3 13.29 44.41"/>
        <path v-if="type == 'key'" :style="iconColor" d="M42,46H8.05A4,4,0,0,1,4,42V8.05A4,4,0,0,1,8.05,4H42a4,4,0,0,1,4,4.05V42A4,4,0,0,1,42,46ZM29.57,29.11,32.23,37h3.44L27.17,12H23.28L14.82,37h3.32l2.59-7.84ZM21.4,26.59l2.44-7.21c.48-1.51.89-3,1.25-4.51h.08c.37,1.44.74,2.92,1.29,4.55l2.44,7.17Z"/>
        <path v-if="type == 'user'" :style="iconColor" d="M34,16a9,9,0,1,1-9-9A9,9,0,0,1,34,16Zm8.06,25.74-2.41-8.43A8.72,8.72,0,0,0,31.27,27H18.73a8.72,8.72,0,0,0-8.38,6.31L7.94,41.74A2.55,2.55,0,0,0,10.39,45H39.61A2.55,2.55,0,0,0,42.06,41.74Z"/>
        <path v-if="type == 'listener'" :style="iconColor" d="M19,17H9V7H19ZM31,7V17H41V7Zm0,14a6,6,0,0,1-6,6,6,6,0,0,1-6-6V19H9v8a16,16,0,0,0,32,0V19H31Z"/>
        <path v-if="type == 'sender'" :style="iconColor" d="M34.76,22.47h-6.4a1.18,1.18,0,0,1-1.11-1.56L32.57,5.55a.47.47,0,0,0-.81-.45L15.14,26.27a1.22,1.22,0,0,0,1,2h6.36a1.18,1.18,0,0,1,1.11,1.57L18.33,44.45a.48.48,0,0,0,.82.45L35.7,24.45A1.22,1.22,0,0,0,34.76,22.47Z"/>
        <path v-if="type == 'cancel'"  :style="iconColor" d="M29.24,25,41.12,13.12a3,3,0,0,0-4.24-4.24L25,20.76,13.12,8.88a3,3,0,0,0-4.24,4.24L20.76,25,8.88,36.88a3,3,0,0,0,0,4.24,3,3,0,0,0,4.24,0L25,29.24,36.88,41.12a3,3,0,0,0,4.24,0,3,3,0,0,0,0-4.24Z"/>
      </svg>
    </div>
  `,
  data() {
    return {
      hover: false,
    }
  },
  computed: {
    iconColor: function() {
      if (this.$root.isWake) {
        if ((this.type == 'cancel') && (this.hover)) {
          return `fill: ${this.$root.getCSS('color-cancel')}`;
        } else {
          return `fill: ${this.$root.getCSS('color-icon')}`;
        }
      } else {
        return `fill: ${this.$root.getCSS('color-text-disabled')}`;
      }
    }
  },
  methods: {
    deleteScribe() {
      if (this.canceller == 'true') {
        console.log(`Deleting ${this.which} of ${this.parent}`)
        Event.$emit('deleteScribe', [this.parent, this.which])
      }
    },
  }
})

Vue.component('scribe-maker', {
  props: {
    version: String,
    name: String,
  },
  template: `
    <div v-if="show" class="texter">
      <toggle-icon />
      <input 
        ref="input"
        :class="getClass()"
        @keyup.enter="submitTest(msg)"
        spellcheck="false"
        v-model="msg" 
        :placeholder="placeholder"/>
    </div>
  `,
  data() {
    return {
      show: true,
      msg: '',
      clone: 'listener',
      placeholder: 'Create new listener',
    }
  },
  methods: {
    getClass() {
      return this.isWake ? 'texter-active' : 'texter-idle'
    },
    submitTest(msg) {
      if (msg.length) {
        if (this.$root.Ctrl) {
          console.log('Change');
          Event.$emit('toggleScribeType');
        } else {
          var construct = [this.msg, this.clone];
          Event.$emit('checkScribe', construct);
        }
      } else if (this.$root.Ctrl) {
        Event.$emit('toggleScribeType');
      }
    },
    verifyTest() {
      console.log(`Construct ${this.clone} for ${this.msg}`)
      var construct = [this.msg, this.clone];
      this.msg = '';
      Event.$emit('addScribe', construct);
    },
    clearScribe() {
      this.msg = '';
    },
    constructEvent() {
      console.log(`Should be sending ${this.msg}`);
      this.$root.dispatchEvent(this.name, this.msg);
    },
    setScribeType(name) {
      console.log('Setting scribe type')
      this.clone = name;
      this.placeholder = `Create new ${name}`;
    },
    toggleType() {
      if (this.clone == 'listener') 
        this.clone = 'sender'
      else
        this.clone = 'listener';
      this.placeholder = `Create new ${this.clone}`;
    }
  },
  computed: {
    isWake: function () {
      return this.$root.isWake;
    },
  },
  mounted() {
    var self = this;
    Event.$on('activeScribe', this.setScribeType);
    Event.$on('verifyTest', this.verifyTest);
    Event.$on('toggleScribeType', this.toggleType);
  }
})

Vue.component('scribe', {
  props: {
    version: String,
    name: String,
  },
  template: `
    <div v-if="show" class="texter">
      <icon :type="version" :parent="name" canceller="false"/>
      <input 
        ref="input"
        :class="getClass()"
        spellcheck="false"
        @keyup.enter="submitTest(msg)" 
        v-model="msg" 
        :placeholder="placeholder"/>
      <icon type="cancel" :parent="name" canceller="true" :which="version"/>
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
        console.log(`Checking event for ${this.name}, ${this.msg}`)
        this.constructEvent();
      }
    },
    clearScribe() {
      this.msg = '';
    },
    setMsg(data) {
      console.log(data)
      this.msg = data.data;
    },
    constructEvent() {
      console.log(`Should be sending ${this.msg} to ${this.name}`);
      this.$root.dispatchEvent(this.name, this.msg);
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
    // console.log(`${this.name} : ${this.version}`)
    if (this.version == 'listener') {
      csInterface.addEventListener(this.name, this.setMsg);
      if (this.name == 'console.log') {
        var root = csInterface.getSystemPath(SystemPath.EXTENSION) + "/host/universal/";
        csInterface.evalScript('$.evalFile("' + root + 'Console.jsx")');
      }
        // csInterface.evalScript()
      // console.log('This is a listener')
    } else {
      Event.$on('dispatchEvent', self.constructEvent);
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
    buildNumber: 0,
    notificationsEnabled: true,
    needsUpdate: false,
    panelWidth: 100,
    panelHeight: 200,
    mouseX: 0,
    mouseY: 0,
    lastKey: 0,
    isDragging: false,
    persistent: true,
    // storage: window.localStorage,
    activeApp: csInterface.hostEnvironment.appName,
    activeTheme: 'darkest',
    showSize: true,
    showUser: true,
    showSystem: true,
    showConsole: true,
    showDebug: true,
    isLinking: true,
    hasLink: false,
    isWake: false,
    Shift: false,
    Ctrl: false,
    Alt: false,
    eventList: [
      { name: 'debug.write', version: 'listener' },
      { name: 'debug.write', version: 'sender' },
    ],
    context: {
      menu: [
        { id: "refresh", label: "Refresh panel", enabled: true, checkable: false, checked: false, },
        { id: "isLinking", label: "Debug link", enabled: true, checkable: true, checked: true, },
        { id: "notificationsEnabled", label: "Show notifications", enabled: true, checkable: true, checked: true, },
        { label: "---" },
        { id: "showSize", label: "Show Size", enabled: true, checkable: true, checked: true, },
        { id: "showUser", label: "Show User", enabled: true, checkable: true, checked: true, },
        { id: "showSystem", label: "Show System", enabled: true, checkable: true, checked: true, },
        { id: "showConsole", label: "Show Console", enabled: true, checkable: true, checked: true, },
        { id: "showDebug", label: "Show Debug", enabled: true, checkable: true, checked: true, },
        { label: "---" },
        { id: "test", label: "Run test", enabled: true, checkable: false, checked: false, },
        { id: "about", label: "See more free panels", enabled: true, checkable: false, checked: false, },
      ],
    },
  },
  computed: {
    menuString: function() { return JSON.stringify(this.context); },
    rootName: function() {
      const str = csInterface.getSystemPath(SystemPath.EXTENSION);
      return str.substring(str.lastIndexOf('/') + 1, str.length);
    },
    isDefault: function() {
      var result = true;
      if ((this.Shift) | (this.Ctrl) | (this.Alt))
        result = false;
      return result;
    },
    isSmall: function() { return (this.panelWidth < 120) ? true : false; },
    isMedium: function () { return ((this.panelWidth > 120) && (this.panelWidth < 200)) ? true : false; },
    isLarge: function () { return (this.panelWidth > 200) ? true : false; },
  },
  mounted() {
    var self = this;
    if (navigator.platform.indexOf('Win') > -1) { this.macOS = false; } else if (navigator.platform.indexOf('Mac') > -1) { this.macOS = true; }
    this.readStorage();
    this.setContextMenu();
    Event.$on('modsUpdate', self.parseModifiers);
    Event.$on('updateStorage', self.updateStorage);
    Event.$on('deleteScribe', self.deleteScribe);
    Event.$on('checkScribe', self.checkExisting);
    Event.$on('addScribe', self.addScribe);
    Event.$on('fetch', self.getVersion);
    Event.$on('checkHTMLData', self.checkHTMLData);
    if (this.isLinking)
      Event.$emit('debug.start');
    this.getVersion();
    this.tryFetch();
    if (this.notificationsEnabled)
      Event.$emit('showNotification');
    else
      Event.$emit('hideNotification');
  },
  methods: {
    getVersion() {
      const path = csInterface.getSystemPath(SystemPath.EXTENSION);
      const xml = window.cep.fs.readFile(`${path}/CSXS/manifest.xml`);
      const verID = /(\w|\<|\s|\=|\"|\.)*ExtensionBundleVersion\=\"(\d|\.)*(?=\")/;
      let match = xml.data.match(verID);
      if (match.length) {
        const str = match[0].split(' ');
        this.buildNumber = str[(str.length - 1)].replace(/\w*\=\"/, '');
      } else {
        this.buildNumber = 'unknown';
      }
      Event.$emit('console.string', this.buildNumber);
    },
    tryFetch() {
      if (this.buildNumber !== '1.0.0') {
        fetch('http://inventsable.cc/master.json')
          .then(function (response) {
            return response.json();
          })
          .then(function(myJson) {
            console.log(myJson);
            Event.$emit('checkHTMLData', myJson);
          });
        Event.$emit('console.full', this.buildNumber);
      } else {
        console.log('This is in dev context');
        this.needsUpdate = false;
      }
    },
    checkHTMLData(result) {
      for (let [key, value] of Object.entries(result.master)) {
        if (key == this.rootName) {
          if (value.version !== this.buildNumber) {
            Event.$emit('promptUpdate', JSON.stringify(value));
            Event.$emit('console.full', JSON.stringify(value))
            this.needsUpdate = true;
          } else {
            this.needsUpdate = false;
          }
        }
      }
    },
    dispatchEvent(name, data) {
      var event = new CSEvent(name, 'APPLICATION');
      event.data = data;
      csInterface.dispatchEvent(event);
    },
    checkExisting(data) {
      var result = this.findScribe(data);
      if (result < 0) {
        Event.$emit('verifyTest', true)
      } else {
        if (data[1] == 'listener') {
          console.log('Construct already exists')
        } else {
          Event.$emit('verifyTest', true)
        }
      }
    },
    findScribe(data) {
      if (data.length) {
        for (var i = 0; i < this.eventList.length; i++) {
          var target = this.eventList[i];
          if ((target.name == data[0]) && (target.version == data[1])) {
            return i;
          }
        }
        return -1;
      }
    },
    deleteScribe(data) {
      let index = this.findScribe(data);
      if (index >= 0) {
        this.eventList.splice(index, 1);
        this.updateStorage();
        Event.$emit('rebuildEvents');
      }
    },
    addScribe(data) {
      var child = {
        name: data[0],
        version: data[1],
      }
      this.eventList.push(child);
      Event.$emit('rebuildEvents');
      this.updateStorage();
    },
    readStorage() {
      var storage = window.localStorage;
      if (storage.length) {
        this.context.menu = JSON.parse(storage.getItem('contextmenu'));
        this.eventList = JSON.parse(storage.getItem('eventList'));
        this.rememberContextMenu(storage)
      }
    },
    updateStorage() {
      var storage = window.localStorage;
      storage.setItem('contextmenu', JSON.stringify(this.context.menu));
      storage.setItem('eventList', JSON.stringify(this.eventList));
      this.setContextMenuMemory(storage);
    },
    setContextMenuMemory(storage) {
      for (var i = 0; i < this.context.menu.length; i++) {
        var target = this.context.menu[i], name = target.id;
        if (target.checkable)
          storage.setItem(name, this[name]);
      }
    },
    rememberContextMenu(storage) {
      for (var i = 0; i < this.context.menu.length; i++) {
        var target = this.context.menu[i], name = target.id;
        if (target.checkable) {
          this[name] = JSON.parse(storage.getItem(name));
          this.context.menu[i].checked = this[name];
        }
      }
    },
    setContextMenu() {
      var self = this;
      csInterface.setContextMenuByJSON(self.menuString, self.contextMenuClicked);
    },
    contextMenuClicked(id) {
      var target = this.findMenuItemById(id), parent = this.findMenuItemById(id, true);
      if (id == "refresh") {
        location.reload();
      } else if (id == 'homepage') {
        cep.util.openURLInDefaultBrowser(this.homepage);
      } else if (id == 'test') {
        console.log('Tried to open new window')
        window.open('https://www.inventsable.cc', '_blank')
        // console.log(testScript)
        // csInterface.evalScript(`runScript('${testScript}')`);
        // loadJSX(csInterface.hostEnvironment.appName + '/host.jsx');
      } else {
        this[id] = !this[id];
        var target = this.findMenuItemById(id);
        target.checked = this[id];
      }
      if (id == 'isLinking') {
        console.log(this.isLinking);
        if (this.isLinking)
          Event.$emit('debug.start');
        else 
          Event.$emit('debug.stop');
      }
      if (id == 'notificationsEnabled') {
        // console.log(this.notificationsEnabled);
        if (this.notificationsEnabled)
          Event.$emit('showNotification');
        else
          Event.$emit('hideNotification');
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
