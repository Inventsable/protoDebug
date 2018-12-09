# protoDebug

## install
``` bash
# use the latest ZXP found in ./_builds/

# or clone into .../AppData/Roaming/Adobe/CEP/extensions/
git clone https://github.com/Inventsable/protoDebug.git
```

## Persistent modular components can listen and send CSEvents to/from any other panel

![](https://thumbs.gfycat.com/SelfassuredSillyAiredaleterrier-size_restricted.gif)

* Pressing Enter adds new listener or sender
* Ctrl/Cmd + Enter toggles if creating listener or sender

## Invisible event-manager component detects all user input

* Window resizing & persistent settings

![](https://thumbs.gfycat.com/DirectLeafyJellyfish-size_restricted.gif)

* Using [vue-outside-events](https://github.com/nchutchind/vue-outside-events) on element with no width or height detects all events of panel:

![](https://thumbs.gfycat.com/TerrificUnfitCrossbill-size_restricted.gif)

## Invisible stylizer component unifies styling to match app theme

* Guarantee of easy styling no matter the UI by using supported CSS variables

![](https://thumbs.gfycat.com/ViciousFormalAfricanbushviper-size_restricted.gif)

``` css
/* CSS variables reactively change via component */
  --panel-width: 50px;
  --panel-height: 50px;
  --color-selection: #46a0f5;

  --color-bg: #323232;
  --color-icon: #a1a1a1;
  --color-border: #3e3e3e;
  --color-button-hover: #292929;
  --color-button-active: #1f1f1f;
  --color-button-disabled: #393939;
  
  --color-text-active: #1b1b1b;
  --color-text-default: #a1a1a1;
  --color-text-disabled: #525252;
  --color-input-focus: #fcfcfc;
  --color-input-idle: #262626;

  --color-scrollbar: #2a2a2a;
  --color-scrollbar-thumb: #3e3e3e;
  --color-scrollbar-thumb-hover: #525252;
  --scrollbar-thumb-width: 20px;
  --scrollbar-thumb-radius: 20px;
/*  */
```


