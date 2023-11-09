/**
    * @name CallTimeCounter
    * @source https://github.com/QWERTxD/BetterDiscordPlugins/blob/main/CallTimeCounter/CallTimeCounter.plugin.js
    * @description Shows how much time you are in a voice chat.
    * @updateUrl https://raw.githubusercontent.com/QWERTxD/BetterDiscordPlugins/main/CallTimeCounter/CallTimeCounter.plugin.js
    * @website https://github.com/QWERTxD/BetterDiscordPlugins/tree/main/CallTimeCounter
    * @version 0.0.6
    */

const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
    info: {
        name: "CallTimeCounter",
        authors: [
            {
                name: "QWERT"
            }
        ],
        version: "0.0.6",
        description: "Shows how much time you are in a voice chat.",
        github_raw: "https://raw.githubusercontent.com/QWERTxD/BetterDiscordPlugins/main/CallTimeCounter/CallTimeCounter.plugin.js",
    },
    changelog: [
        {
            title: "Fixes",
            type: "fixed",
            items: [
                "Fixed for BetterDiscord 1.8 update."
            ]
        }
    ],
    defaultConfig: []
};

module.exports = !global.ZeresPluginLibrary ? class {
    constructor() {
        this._config = config;
    }

    load() {
        BdApi.showConfirmationModal("Library plugin is needed",
            `The library plugin needed for AQWERT'sPluginBuilder is missing. Please click Download Now to install it.`, {
            confirmText: "Download",
            cancelText: "Cancel",
            onConfirm: () => {
                request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
                    if (error)
                        return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");

                    fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
                });
            }
        });
    }

    start() { }

    stop() { }
} : (([Plugin, Library]) => {
    const { DiscordModules, WebpackModules, Patcher, PluginUtilities } = Library;
    const { React, SelectedChannelStore: {getVoiceChannelId} } = DiscordModules;
    const PanelSubtext = WebpackModules.find(m => m?.$$typeof?.toString() === "Symbol(react.forward_ref)"
        && m.render?.toString().includes("createHref"), {searchExports: true});
    let lastVoice, lastState;
    const Dispatcher = WebpackModules.getByProps('dispatch', 'register');

    class Timer extends React.Component {
        constructor(props) {
            super(props);
            this.connected = this.connected.bind(this);
            this.state = {
                startTime: 0,
                delta: 0
            };
        }

        connected(e) {
            if (e.state && e.state === 'RTC_DISCONNECTED' && !e.hasOwnProperty('streamKey')) {
                this.setState((prev) => (
                    prev.startTime = Date.now()));
            }
        }

        componentDidMount() {
            if(lastVoice === getVoiceChannelId()) {
                Dispatcher.subscribe('RTC_CONNECTION_STATE', this.connected);
                this.setState(lastState);
                this.interval = setInterval(() => {
                    this.setState((prev) => (prev.delta = Math.round((Date.now() - prev.startTime) / 1000) * 1000));
                    this.setState((prev) => prev.lastVoice = getVoiceChannelId());
                }, 1000);
            }else{
                this.setState((prev) => (
                    prev.startTime = Date.now()));
                Dispatcher.subscribe('RTC_CONNECTION_STATE', this.connected);
                this.interval = setInterval(() => {
                    this.setState((prev) => (prev.delta = Math.round((Date.now() - prev.startTime) / 1000) * 1000));
                    this.setState((prev) => prev.lastVoice = getVoiceChannelId());
                }, 1000);
            }
        }

        componentWillUnmount() {
            Dispatcher.unsubscribe('RTC_CONNECTION_STATE', this.connected);
            lastVoice = this.state.lastVoice;
            lastState = this.state;
            setTimeout(() => {
                lastVoice = null;
                lastState = {};
            }, 1000)
            clearInterval(this.interval);
        }

        render() {
            return React.createElement("div", { className: "voiceTimer" }, `Time elapsed: ${new Date(this.state.delta).toISOString().substr(11, 8)}`);
        }
    };

    class plugin extends Plugin {
        constructor() {
            super();
        }


        onStart() {
            this.patch();

            PluginUtilities.addStyle("voicetimer", `
           .voiceTimer {
             text-decoration: none !important;
             margin-top: 8px;
           }
           `)
        }

        onStop() {
            Patcher.unpatchAll();
            PluginUtilities.removeStyle("voicetimer");
        }

        patch() {
            Patcher.before(PanelSubtext, "render", (_, [props], ret) => {
                if (!props?.children?.props?.className?.includes("channel")) return;
                props.children.props.children = [
                    props.children.props.children,
                    React.createElement(Timer, { className: "voiceTimer" })
                ]
            });
        }

    }

    return plugin;
})(global.ZeresPluginLibrary.buildPlugin(config));
