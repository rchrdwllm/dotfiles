/**
 * @name BetterAnimations
 * @author arg0NNY
 * @authorLink https://github.com/arg0NNY/DiscordPlugins
 * @invite M8DBtcZjXD
 * @version 1.1.17
 * @description Improves your whole Discord experience. Adds highly customizable switching animations between guilds, channels, etc. Introduces smooth new message reveal animations, along with popout animations, and more.
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/BetterAnimations
 * @source https://github.com/arg0NNY/DiscordPlugins/blob/master/BetterAnimations/BetterAnimations.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/BetterAnimations/BetterAnimations.plugin.js
 */

module.exports = (() => {
    const config = {
        "info": {
            "name": "BetterAnimations",
            "authors": [
                {
                    "name": "arg0NNY",
                    "discord_id": '224538553944637440',
                    "github_username": 'arg0NNY'
                }
            ],
            "version": "1.1.17",
            "description": "Improves your whole Discord experience. Adds highly customizable switching animations between guilds, channels, etc. Introduces smooth new message reveal animations, along with popout animations, and more.",
            github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/BetterAnimations",
            github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/BetterAnimations/BetterAnimations.plugin.js"
        },
        "changelog": [
            {
                "type": "fixed",
                "title": "Fixed",
                "items": [
                    "Completely fixed animation type selector often not displayed.",
                    "Slightly optimized switching animations performance."
                ]
            }
        ]
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }

        getName() { return config.info.name; }
        getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
        getDescription() { return config.info.description; }
        getVersion() { return config.info.version; }

        load() {
            BdApi.UI.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() { }
        stop() { }
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const {
                DOM
            } = BdApi;

            const {
                WebpackModules,
                Patcher,
                DiscordClasses,
                Logger,
                DiscordModules,
                Settings,
                Toasts,
                PluginUpdater
            } = Api;

            const {
                React,
                SelectedGuildStore,
                ChannelActions,
                UserSettingsWindow,
                GuildSettingsWindow,
                ChannelSettingsWindow,
                UserStore,
                ButtonData
            } = DiscordModules;

            function getMangled(filter) {
                const target = WebpackModules.getModule(m => Object.values(m).some(filter), {searchGetters: false});
                return target ? [
                    target,
                    Object.keys(target).find(k => filter(target[k]))
                ] : [];
            }

            const Dispatcher = WebpackModules.getByProps('_subscriptions', '_waitQueue');

            // const {
            //     MessageStates
            // } = DiscordConstants;
            const MessageStates = {
                SENDING: 'SENDING',
            }

            const ActionTypes = {
                MESSAGE_CREATE: 'MESSAGE_CREATE',
                CHANNEL_SELECT: 'CHANNEL_SELECT',
            }

            const Common = WebpackModules.getByProps('Shakeable', 'List');
            const { ReferencePositionLayer, Anchor } = Common;
            const ChannelIntegrationsSettingsWindow = WebpackModules.getByProps('setSection', 'saveWebhook');
            // const {PreloadedUserSettingsActionCreators} = WebpackModules.getByProps('PreloadedUserSettingsActionCreators');
            const { Route: RouteWithImpression } = WebpackModules.getByProps('Route', 'Router');
            const Button = ButtonData;
            const UserPopout = WebpackModules.getModule(m => m?.type?.toString?.().includes('Unexpected missing user'), {searchExports: true});

            function buildSelectors (selectors) {
                const result = {};
                Object.entries(selectors).forEach(([key, selector]) => {
                    let getter, defaultValue;
                    if (Array.isArray(selector)) [getter, defaultValue] = selector;
                    else getter = selector;

                    let memoized = null;
                    Object.defineProperty(result, key, {
                        get: () => {
                            if (memoized === null) {
                                memoized = getter();
                                if (!memoized || !Object.keys(memoized).length) setTimeout(() => memoized = null, 5000);
                            }
                            return Object.assign(defaultValue ?? {}, memoized);
                        }
                    })
                })
                return result;
            }

            const Selectors = buildSelectors({
                Chat: () => WebpackModules.getByProps('chat', 'channelName'),
                Messages: () => WebpackModules.getByProps('scroller', 'messages'),
                Layout: () => WebpackModules.getByProps('base', 'content'),
                ChannelsList: () => WebpackModules.getByProps('scroller', 'unread'),
                PeopleTab: () => WebpackModules.getByProps('container', 'peopleColumn'),
                ApplicationStore: () => WebpackModules.getByProps('applicationStore', 'marketingHeader'),
                PeopleList: () => WebpackModules.getByProps('peopleList', 'searchBar'),
                FriendsActivity: () => WebpackModules.getByProps('scroller', 'header', 'container'),
                PageContainer: () => WebpackModules.getByProps('headerBar', 'homeWrapper'),
                Pages: () => WebpackModules.getByProps('pageWrapper', 'searchPage'),
                Content: () => WebpackModules.getByProps('content', 'fade'),
                Sidebar: [
                    () => WebpackModules.getByProps('contentRegion', 'sidebar'),
                    {
                        contentRegion: 'contentRegion__0bec1',
                        contentRegionScroller: 'contentRegionScroller__86c79',
                        standardSidebarView: 'standardSidebarView__1129a'
                    }
                ],
                Settings: [
                    () => ({
                        ...WebpackModules.getByProps('contentContainer', 'optionContainer'),
                        ...WebpackModules.getByProps('messageContainer', 'colorPicker')
                    }),
                    { scroller: 'scroller__79060', contentContainer: 'contentContainer__23092' }
                ],
                SettingsSidebar: [
                    () => WebpackModules.getByProps('addRole', 'sidebar'),
                    { sidebar: 'sidebar_bdf6b7' }
                ],
                Animations: () => WebpackModules.getByProps('translate', 'fade'),
                Members: () => WebpackModules.getByProps('members', 'hiddenMembers'),
                EmojiPicker: () => WebpackModules.getByProps('emojiPickerHasTabWrapper', 'emojiPicker'),
                StickerPicker: () => WebpackModules.getAllByProps('listWrapper', 'loadingIndicator')?.filter(m => !m?.gridNoticeWrapper)[0],
                GifPicker: () => WebpackModules.getByProps('searchBar', 'backButton'),
                Popout: () => WebpackModules.getByProps('disabledPointerEvents', 'layer'),
                ThreadSidebar: () => WebpackModules.getByProps('container', 'resizeHandle'),
                Stickers: [
                    () => WebpackModules.getByProps('grid', 'uploadCard'),
                    { grid: 'grid_da1263' }
                ],
                Sticker: [
                    () => WebpackModules.getByProps('stickerName', 'sticker'),
                    { sticker: 'sticker_c2f81a', wrapper: 'wrapper__93f27', content: 'content__59691', stickerName: 'stickerName_e362ee' }
                ],
                Sizes: () => WebpackModules.getByProps('size10', 'size12'),
                Colors: () => WebpackModules.getByProps('colorHeaderPrimary', 'colorWhite'),
                VideoOptions: [
                    () => WebpackModules.getByProps('backgroundOptionRing'),
                    { backgroundOptionRing: 'backgroundOptionRing__1f209' }
                ],
                StudentHubs: () => WebpackModules.getByProps('footerDescription', 'scroller')
            });

            const PARENT_NODE_CLASSNAME = 'BetterAnimations-parentNode';
            const CLONED_NODE_CLASSNAME = 'BetterAnimations-clonedNode';
            const SETTINGS_CLASSNAME = 'BetterAnimations-settings';

            class History {
                constructor(current = null) {
                    this.current = current;
                    this.previous = null;
                }

                push(current) {
                    this.previous = this.current;
                    this.current = current;
                }
            }
            const GuildIdHistory = new History(SelectedGuildStore.getGuildId() ?? '@me');
            const RoutePathHistory = new History();
            const RouteLocationHistory = new History();
            const GuildSettingsRoleIdHistory = new History();
            const SettingsSectionHistory = new History();
            const ChannelIntegrationsSectionHistory = new History();
            const ExpressionPickerViewHistory = new History();
            const ThreadsPopoutSectionHistory = new History();
            const GuildDiscoveryCategoryHistory = new History();

            class Route {
                constructor(name, path, {element, scrollers, getter, forceGuildChange, noGuilds}) {
                    this.name = name;
                    this.path = typeof path === 'object' ? path : [path];
                    this._element = element;
                    this._scrollers = scrollers;
                    this._getter = getter;
                    this.forceGuildChange = !!forceGuildChange;
                    this.noGuilds = !!noGuilds;
                }

                get _guildSwitched() {
                    return !this.noGuilds && (this.forceGuildChange || GuildIdHistory.previous !== GuildIdHistory.current);
                }

                get element() {
                    return !this._guildSwitched ? (this._getter ? this._getter().element : this._element) : `.${Selectors.Layout.base}`;
                }

                get scrollers() {
                    return [...(this._getter ? this._getter().scrollers : this._scrollers), ...(this._guildSwitched ? [Selectors.ChannelsList.scroller] : [])];
                }
            }
            const Routes = [
                new Route('Chat', [
                    "/channels/:guildId/:channelId/threads/:threadId",
                    "/channels/@me/:channelId",
                    "/channels/:guildId/:channelId?/:messageId?",
                    "/channels/:guildId/:channelId/threads/:threadId/:messageId?"
                ], {
                    element: `.${Selectors.Chat.chat}`,
                    scrollers: [Selectors.Messages.scroller, DiscordClasses.MemberList.members.value, Selectors.Content.scrollerBase]
                }),
                new Route('Friends', '/channels/@me', {
                    element: `.${Selectors.PeopleTab.container}`,
                    scrollers: [Selectors.PeopleList.peopleList, Selectors.FriendsActivity.scroller]
                }),
                new Route('Store', '/store', {
                    element: `.${Selectors.ApplicationStore.applicationStore}`,
                    scrollers: [Selectors.PageContainer.scroller]
                }),
                new Route('GuildDiscovery', '/guild-discovery', {
                    element: `.${Selectors.Layout.base}`,
                    scrollers: [Selectors.Pages.scroller, Selectors.Content.scrollerBase],
                    forceGuildChange: true
                }),
            ];

            const Easing = {
                linear: 'linear',
                ease: 'ease',
                easeIn: 'ease-in',
                easeOut: 'ease-out',
                easeInOut: 'ease-in-out',
                easeInSine: 'cubic-bezier(0.12, 0, 0.39, 0)',
                easeOutSine: 'cubic-bezier(0.61, 1, 0.88, 1)',
                easeInOutSine: 'cubic-bezier(0.37, 0, 0.63, 1)',
                easeInQuad: 'cubic-bezier(0.11, 0, 0.5, 0)',
                easeOutQuad: 'cubic-bezier(0.5, 1, 0.89, 1)',
                easeInOutQuad: 'cubic-bezier(0.45, 0, 0.55, 1)',
                easeInCubic: 'cubic-bezier(0.32, 0, 0.67, 0)',
                easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
                easeInOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
                easeInQuart: 'cubic-bezier(0.5, 0, 0.75, 0)',
                easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
                easeInOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)',
                easeInQuint: 'cubic-bezier(0.64, 0, 0.78, 0)',
                easeOutQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',
                easeInOutQuint: 'cubic-bezier(0.83, 0, 0.17, 1)',
                easeInExpo: 'cubic-bezier(0.7, 0, 0.84, 0)',
                easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
                easeInOutExpo: 'cubic-bezier(0.87, 0, 0.13, 1)',
                easeInCirc: 'cubic-bezier(0.55, 0, 1, 0.45)',
                easeOutCirc: 'cubic-bezier(0, 0.55, 0.45, 1)',
                easeInOutCirc: 'cubic-bezier(0.85, 0, 0.15, 1)',
                easeInBack: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
                easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                easeInOutBack: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
            }

            let channelChanged = false;
            let mainAnimator = null;

            class ContainerAnimator {
                static TYPES = {
                    fade: (node, clonedNode, {duration, easing}) => {
                        return new Promise(res => {

                            clonedNode.animate(
                                {
                                    opacity: [1, 0],
                                },
                                {
                                    duration,
                                    easing
                                }
                            ).finished.then(() => {res()});

                        });
                    },

                    slipUp: (node, clonedNode, {duration, easing, offset}) => ContainerAnimator.TYPES.slipVertical(node, clonedNode, {duration, easing, offset, upwards: true}),
                    slipDown: (node, clonedNode, {duration, easing, offset}) => ContainerAnimator.TYPES.slipVertical(node, clonedNode, {duration, easing, offset, upwards: false}),
                    slipVertical: (node, clonedNode, {duration, easing, offset, upwards}) => {
                        return new Promise(res => {

                            node.animate(
                                {transform: [`translateY(${!upwards ? '-' : ''}${offset ?? 50}px)`, `translateY(0)`], opacity: [0, 1]},
                                {duration, easing}
                            );

                            clonedNode.animate(
                                [
                                    {transform: 'translateY(0)', opacity: 1},
                                    {transform: `translateY(${upwards ? '-' : ''}${offset ?? 50}px)`, opacity: 0},
                                ],
                                {duration, easing}
                            ).finished.then(() => {res()});

                        });
                    },

                    slipLeft: (node, clonedNode, {duration, easing, offset}) => ContainerAnimator.TYPES.slipHorizontal(node, clonedNode, {duration, easing, offset, upwards: true}),
                    slipRight: (node, clonedNode, {duration, easing, offset}) => ContainerAnimator.TYPES.slipHorizontal(node, clonedNode, {duration, easing, offset, upwards: false}),
                    slipHorizontal: (node, clonedNode, {duration, easing, offset, upwards}) => {
                        return new Promise(res => {

                            node.animate(
                                {transform: [`translateX(${!upwards ? '-' : ''}${offset ?? 50}px)`, 'translateX(0)'], opacity: [0, 1]},
                                {duration, easing}
                            );

                            clonedNode.animate(
                                [
                                    {transform: 'translateX(0)', opacity: 1},
                                    {transform: `translateX(${upwards ? '-' : ''}${offset ?? 50}px)`, opacity: 0},
                                ],
                                {duration, easing}
                            ).finished.then(() => {res()});

                        });
                    },

                    scaleForwards: (node, clonedNode, {duration, easing, scale, zIndex}) => ContainerAnimator.TYPES.scale(node, clonedNode, {duration, easing, scale, zIndex, forwards: true}),
                    scaleBackwards: (node, clonedNode, {duration, easing, scale, zIndex}) => ContainerAnimator.TYPES.scale(node, clonedNode, {duration, easing, scale, zIndex, forwards: false}),
                    scale: (node, clonedNode, {duration, easing, scale, forwards, zIndex}) => {
                        return new Promise(res => {

                            scale = scale ?? .05;

                            if (forwards) node.style.zIndex = zIndex + 1;
                            node.animate(
                                [
                                    {transform: `scale(${forwards ? 1 + scale : 1 - scale})`, opacity: forwards ? 0 : 1},
                                    {transform: 'scale(1)', opacity: 1},
                                ],
                                {duration, easing}
                            ).finished.then(() => {node.style.zIndex = ''});

                            clonedNode.animate(
                                [
                                    {transform: 'scale(1)', opacity: 1},
                                    {transform: `scale(${!forwards ? 1 + scale : 1 - scale})`, opacity: forwards ? 1 : 0},
                                ],
                                {duration, easing}
                            ).finished.then(() => {res()});

                        });
                    },

                    scaleUp: (node, clonedNode, {duration, easing, scale, zIndex}) => ContainerAnimator.TYPES.scaleVertical(node, clonedNode, {duration, easing, scale, zIndex, upwards: true}),
                    scaleDown: (node, clonedNode, {duration, easing, scale, zIndex}) => ContainerAnimator.TYPES.scaleVertical(node, clonedNode, {duration, easing, scale, zIndex, upwards: false}),
                    scaleVertical: (node, clonedNode, {duration, easing, scale, upwards, zIndex}) => {
                        return new Promise(res => {

                            scale = scale ?? .05;

                            node.style.zIndex = zIndex + 1;
                            node.animate(
                                [
                                    {transform: `translateY(${upwards ? '' : '-'}100%)`, opacity: 0},
                                    {transform: `translateY(0)`, opacity: 1},
                                ],
                                {duration, easing}
                            ).finished.then(() => {node.style.zIndex = ''});

                            clonedNode.animate(
                                [
                                    {transform: 'scale(1)', opacity: 1},
                                    {transform: `scale(${1 - scale})`, opacity: 0},
                                ],
                                {duration, easing}
                            ).finished.then(() => {res()});

                        });
                    },

                    scaleLeft: (node, clonedNode, {duration, easing, scale, zIndex}) => ContainerAnimator.TYPES.scaleHorizontal(node, clonedNode, {duration, easing, scale, zIndex, upwards: true}),
                    scaleRight: (node, clonedNode, {duration, easing, scale, zIndex}) => ContainerAnimator.TYPES.scaleHorizontal(node, clonedNode, {duration, easing, scale, zIndex, upwards: false}),
                    scaleHorizontal: (node, clonedNode, {duration, easing, scale, upwards, zIndex}) => {
                        return new Promise(res => {

                            scale = scale ?? .05;

                            node.style.zIndex = zIndex + 1;
                            node.animate(
                                [
                                    {transform: `translateX(${upwards ? '' : '-'}100%)`, opacity: 0},
                                    {transform: `translateX(0)`, opacity: 1},
                                ],
                                {duration, easing}
                            ).finished.then(() => {node.style.zIndex = ''});

                            clonedNode.animate(
                                [
                                    {transform: 'scale(1)', opacity: 1},
                                    {transform: `scale(${1 - scale})`, opacity: 0},
                                ],
                                {duration, easing}
                            ).finished.then(() => {res()});

                        });
                    },

                    scaleChange: (node, clonedNode, {duration, easing, scale}) => {
                        return new Promise(res => {

                            scale = scale ?? .05;

                            node.animate(
                                [
                                    {transform: `scale(${1 - scale})`, opacity: 0},
                                    {transform: `scale(${1 - scale})`, opacity: 0},
                                    {transform: 'scale(1)', opacity: 1},
                                ],
                                {duration, easing}
                            );

                            clonedNode.animate(
                                [
                                    {transform: 'scale(1)', opacity: 1},
                                    {transform: `scale(${1 - scale})`, opacity: 0},
                                    {transform: `scale(${1 - scale})`, opacity: 0},
                                ],
                                {duration, easing}
                            ).finished.then(() => {res()});

                        });
                    },

                    slideUp: (node, clonedNode, {duration, easing}) => ContainerAnimator.TYPES.slideVertical(node, clonedNode, {duration, easing, upwards: true}),
                    slideDown: (node, clonedNode, {duration, easing}) => ContainerAnimator.TYPES.slideVertical(node, clonedNode, {duration, easing, upwards: false}),
                    slideVertical: (node, clonedNode, {duration, easing, upwards}) => {
                        return new Promise(res => {

                            node.animate(
                                {transform: [`translateY(${!upwards ? '-' : ''}100%)`, 'translateY(0)'], opacity: [0, 1]},
                                {duration, easing}
                            );

                            clonedNode.animate(
                                [
                                    {transform: 'translateY(0)', opacity: 1},
                                    {transform: `translateY(${upwards ? '-' : ''}100%)`, opacity: 0},
                                ],
                                {duration, easing}
                            ).finished.then(() => {res()});

                        });
                    },

                    slideLeft: (node, clonedNode, {duration, easing}) => ContainerAnimator.TYPES.slideHorizontal(node, clonedNode, {duration, easing, upwards: true}),
                    slideRight: (node, clonedNode, {duration, easing}) => ContainerAnimator.TYPES.slideHorizontal(node, clonedNode, {duration, easing, upwards: false}),
                    slideHorizontal: (node, clonedNode, {duration, easing, upwards}) => {
                        return new Promise(res => {

                            node.animate(
                                {transform: [`translateX(${!upwards ? '-' : ''}100%)`, 'translateX(0)'], opacity: [0, 1]},
                                {duration, easing}
                            );

                            clonedNode.animate(
                                [
                                    {transform: 'translateX(0)', opacity: 1},
                                    {transform: `translateX(${upwards ? '-' : ''}100%)`, opacity: 0},
                                ],
                                {duration, easing}
                            ).finished.then(() => {res()});

                        });
                    },

                    flipRight: (node, clonedNode, {duration, easing}) => ContainerAnimator.TYPES.flipVertical(node, clonedNode, {duration, easing, forwards: true}),
                    flipLeft: (node, clonedNode, {duration, easing}) => ContainerAnimator.TYPES.flipVertical(node, clonedNode, {duration, easing, forwards: false}),
                    flipVertical: (node, clonedNode, {duration, easing, forwards}) => {
                        return new Promise(res => {
                            const rect = {
                                top: node.offsetTop,
                                left: node.offsetLeft,
                                width: node.clientWidth,
                                height: node.clientHeight
                            };

                            node.parentNode.style.perspective = '1750px';
                            node.parentNode.style.perspectiveOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
                            node.animate(
                                {transform: [`rotateY(${forwards ? '-' : ''}90deg)`, `rotateY(${forwards ? '-' : ''}90deg)`, `rotateY(0)`]},
                                {duration, easing}
                            );

                            clonedNode.animate(
                                {transform: [`rotateY(0)`, `rotateY(${!forwards ? '-' : ''}90deg)`, `rotateY(${!forwards ? '-' : ''}90deg)`]},
                                {duration, easing}
                            ).finished.then(() => {res()});

                        });
                    },

                    flipForwards: (node, clonedNode, {duration, easing}) => ContainerAnimator.TYPES.flipHorizontal(node, clonedNode, {duration, easing, forwards: true}),
                    flipBackwards: (node, clonedNode, {duration, easing}) => ContainerAnimator.TYPES.flipHorizontal(node, clonedNode, {duration, easing, forwards: false}),
                    flipHorizontal: (node, clonedNode, {duration, easing, forwards}) => {
                        return new Promise(res => {
                            const rect = {
                                top: node.offsetTop,
                                left: node.offsetLeft,
                                width: node.clientWidth,
                                height: node.clientHeight
                            };

                            node.parentNode.style.perspective = '1750px';
                            node.parentNode.style.perspectiveOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
                            node.animate(
                                {transform: [`rotateX(${forwards ? '-' : ''}90deg)`, `rotateX(${forwards ? '-' : ''}90deg)`, `rotateX(0)`]},
                                {duration, easing}
                            );

                            clonedNode.animate(
                                {transform: [`rotateX(0)`, `rotateX(${!forwards ? '-' : ''}90deg)`, `rotateX(${!forwards ? '-' : ''}90deg)`]},
                                {duration, easing}
                            ).finished.then(() => {res()});

                        });
                    },
                };


                constructor(type, element, scrollSelectors = [], { elementToAppear, zIndex } = {}) {
                    if (!ContainerAnimator.TYPES.hasOwnProperty(type)) return Logger.err('Invalid animation type.');

                    this.animation = ContainerAnimator.TYPES[type];
                    this.node = typeof element === 'string' ? document.querySelector(element) : element;
                    this.parentNode = this.node?.parentNode;
                    this.scrollSelectors = scrollSelectors;
                    if (elementToAppear) this.elementToAppear = elementToAppear;
                    this.zIndex = zIndex ?? 10;

                    this.animated = false;

                    this.init();
                }

                init() {
                    if (!this.node) return Logger.warn('Unable to find node to animate.');
                    const rect = {
                        top: this.node.offsetTop,
                        left: this.node.offsetLeft,
                        width: this.node.clientWidth,
                        height: this.node.clientHeight
                    };

                    if (getComputedStyle(this.parentNode).position === 'static') this.parentNode.classList.add(PARENT_NODE_CLASSNAME);

                    this.clonedNode = this.node.cloneNode(true);
                    this.node.after(this.clonedNode);
                    this.node.style.opacity = 0;
                    if (document.querySelector(this.elementToAppear) === null) {
                        this.tempStyle = document.createElement('style');
                        this.tempStyle.innerHTML = `${this.elementToAppear} { opacity: 0 !important; }`;
                        this.node.after(this.tempStyle);
                    }

                    this.clonedNode.querySelectorAll('video').forEach(v => v.volume = 0);
                    this.clonedNode.style.position = getComputedStyle(this.node).position === 'fixed' ? 'fixed' : 'absolute';
                    this.clonedNode.style.zIndex = this.zIndex;
                    this.clonedNode.style.pointerEvents = 'none';
                    this.clonedNode.classList.add(CLONED_NODE_CLASSNAME);
                    ['top', 'left', 'width', 'height'].forEach(p => this.clonedNode.style[p] = rect[p] + 'px');

                    const query = this.scrollSelectors.map(s => '.'+s).join(', ')
                    const scrollers = Array.from(this.node.querySelectorAll(query))
                    if (scrollers.length) {
                        const clonedScrollers = Array.from(this.clonedNode.querySelectorAll(query))
                        clonedScrollers.forEach((e, i) => e.scrollTop = scrollers[i].scrollTop)
                    }
                    // this.scrollSelectors.forEach(s => this.node.querySelector(`.${s}`) ? Array.from(this.clonedNode.querySelectorAll(`.${s}`)).forEach((e, i) => e.scrollTop = this.node.querySelectorAll(`.${s}`)[i].scrollTop) : null);
                }

                animate(params = {}) {
                    if (this.animated || !this.clonedNode) return false;
                    this.animated = true;

                    const getNode = e => typeof e === 'string' ? document.querySelector(e) : e;

                    const exec = () => {
                        this.node.removeAttribute('style');
                        this.tempStyle?.remove();
                        params.duration = params.duration ?? 500;
                        params.easing = params.easing ?? Easing.easeInOut;
                        params.zIndex = this.zIndex;

                        this.animation(this.elementToAppear ?? this.node, this.clonedNode, params).then(() => {
                            this.end();
                        });
                    }

                    if (this.elementToAppear)
                        setTimeout(() => {
                            this.elementToAppear = getNode(this.elementToAppear);
                            exec();
                        }, 1);
                    else exec();

                    return true;
                }

                forceEnd() {
                    clearTimeout(this.animateTimeout);
                    this.end();
                }

                end() {
                    this.tempStyle?.remove();
                    this.parentNode.classList.remove(PARENT_NODE_CLASSNAME);

                    if (!this.clonedNode) return;
                    this.clonedNode.remove();
                    this.clonedNode = null;
                }
            }

            class RevealAnimator {
                static TYPES = {
                    fade: (node, {duration, easing, reverse}) => {
                        return new Promise(res => {

                            node.animate(
                                {
                                    opacity: [0, 1],
                                },
                                {
                                    duration,
                                    easing,
                                    direction: reverse ? 'reverse' : 'normal'
                                }
                            ).finished.then(() => {res()});

                        });
                    },

                    slip: (node, {duration, easing, reverse, offset, position}) => {
                        return new Promise(res => {

                            node.animate(
                                [
                                    {opacity: 0, transform: `translate${['top', 'bottom'].includes(position) ? 'Y' : 'X'}(${['right', 'bottom'].includes(position) ? '' : '-'}${offset ?? 10}px)`},
                                    {opacity: 1, transform: `translate${['top', 'bottom'].includes(position) ? 'Y' : 'X'}(0)`},
                                ],
                                {duration, easing, direction: reverse ? 'reverse' : 'normal'}
                            ).finished.then(() => {res()});

                        });
                    },

                    scaleForwards: (node, {duration, easing, reverse, scale}) => {
                        return new Promise(res => {

                            scale = scale ?? .1;

                            node.animate(
                                [
                                    {opacity: 0, transform: `scale(${1 + scale})`},
                                    {opacity: 1, transform: ``},
                                ],
                                {duration, easing, direction: reverse ? 'reverse' : 'normal'}
                            ).finished.then(() => {res()});

                        });
                    },
                    scaleBackwards: (node, {duration, easing, reverse, scale}) => {
                        return new Promise(res => {

                            scale = scale ?? .1;

                            node.animate(
                                [
                                    {opacity: 0, transform: `scale(${1 - scale})`},
                                    {opacity: 1, transform: ``},
                                ],
                                {duration, easing, direction: reverse ? 'reverse' : 'normal'}
                            ).finished.then(() => {res()});

                        });
                    },

                    scaleForwardsSide: (node, {duration, easing, reverse, scale, position}) => {
                        return new Promise(res => {

                            scale = scale ?? .1;

                            const opposite = {
                                top: 'bottom',
                                bottom: 'top',
                                left: 'right',
                                right: 'left',
                            }

                            node.style.transformOrigin = `${opposite[position]} center`;
                            node.animate(
                                [
                                    {opacity: 0, transform: `scale(${1 + scale})`},
                                    {opacity: 1, transform: ``},
                                ],
                                {duration, easing, direction: reverse ? 'reverse' : 'normal'}
                            ).finished.then(() => {res()});

                        });
                    },
                    scaleBackwardsSide: (node, {duration, easing, reverse, scale, position}) => {
                        return new Promise(res => {

                            scale = scale ?? .1;

                            const opposite = {
                                top: 'bottom',
                                bottom: 'top',
                                left: 'right',
                                right: 'left',
                            }

                            node.style.transformOrigin = `${opposite[position]} center`;
                            node.animate(
                                [
                                    {opacity: 0, transform: `scale(${1 - scale})`},
                                    {opacity: 1, transform: ``},
                                ],
                                {duration, easing, direction: reverse ? 'reverse' : 'normal'}
                            ).finished.then(() => {res()});

                        });
                    },

                    rotateForwardsLeft: (node, {duration, easing, reverse, scale}) => RevealAnimator.TYPES.rotate(node, {duration, easing, reverse, scale, left: true, forwards: true}),
                    rotateForwardsRight: (node, {duration, easing, reverse, scale}) => RevealAnimator.TYPES.rotate(node, {duration, easing, reverse, scale, left: false, forwards: true}),
                    rotateBackwardsLeft: (node, {duration, easing, reverse, scale}) => RevealAnimator.TYPES.rotate(node, {duration, easing, reverse, scale, left: true, forwards: false}),
                    rotateBackwardsRight: (node, {duration, easing, reverse, scale}) => RevealAnimator.TYPES.rotate(node, {duration, easing, reverse, scale, left: false, forwards: false}),
                    rotate: (node, {duration, easing, reverse, scale, left, forwards}) => {
                        return new Promise(res => {

                            scale = scale ?? .1;
                            node.animate(
                                [
                                    {opacity: 0, transform: `scale(${forwards ? 1 + scale : 1 - scale}) rotate(${left ? '' : '-'}10deg)`},
                                    {opacity: 1, transform: ``},
                                ],
                                {duration, easing, direction: reverse ? 'reverse' : 'normal'}
                            ).finished.then(() => {res()});

                        });
                    },

                    flip: (node, {duration, easing, reverse, position}) => {
                        return new Promise(res => {
                            const opposite = {
                                top: 'bottom',
                                bottom: 'top',
                                left: 'right',
                                right: 'left',
                            }

                            node.style.transformOrigin = `${opposite[position]} center`;
                            node.animate(
                                [
                                    {opacity: 0, transform: `rotate${['top', 'bottom'].includes(position) ? 'X' : 'Y'}(${['right', 'bottom'].includes(position) ? '' : '-'}90deg)`},
                                    {opacity: 1, transform: `rotate${['top', 'bottom'].includes(position) ? 'X' : 'Y'}(0)`},
                                ],
                                {duration, easing, direction: reverse ? 'reverse' : 'normal'}
                            ).finished.then(() => {
                                node.style.transformOrigin = '';
                                res();
                            });

                        });
                    },

                    slipScale: (node, {duration, easing, reverse, offset, position, scale}) => {
                        return new Promise(res => {

                            scale = scale ?? .1;

                            node.animate(
                                [
                                    {opacity: 0, transform: `translate${['top', 'bottom'].includes(position) ? 'Y' : 'X'}(${['right', 'bottom'].includes(position) ? '-' : ''}${offset ?? 10}px) scale(${1 - scale})`},
                                    {opacity: 1, transform: `translate${['top', 'bottom'].includes(position) ? 'Y' : 'X'}(0) scale(1)`},
                                ],
                                {duration, easing, direction: reverse ? 'reverse' : 'normal'}
                            ).finished.then(() => {res()});

                        });
                    },
                };

                static getDiscordAnimationsSelector() {
                    let selector = '';

                    Object.keys(Selectors.Animations).forEach(k => {
                        selector += `.${Selectors.Animations[k]}, `;
                    });

                    return selector.slice(0, -2);
                }

                constructor(type, element, {needsCopy, scrollSelectors} = {}) {
                    if (!RevealAnimator.TYPES.hasOwnProperty(type)) return Logger.err('Invalid animation type.');

                    this.animation = RevealAnimator.TYPES[type];
                    this.node = typeof element === 'string' ? document.querySelector(element) : element;
                    this.needsCopy = needsCopy;
                    this.scrollSelectors = scrollSelectors ?? [];

                    this.animated = false;

                    if (needsCopy) this.copyNode();
                }

                copyNode() {
                    const rect = {
                        top: this.node.offsetTop,
                        left: this.node.offsetLeft,
                        width: this.node.clientWidth,
                        height: this.node.clientHeight
                    };

                    this.node.parentNode.style.position = getComputedStyle(this.node.parentNode).position === 'static' ? 'relative' : '';

                    const clonedNode = this.node.cloneNode(true);
                    this.node.after(clonedNode);

                    clonedNode.style.position = getComputedStyle(this.node).position === 'fixed' ? 'fixed' : 'absolute';
                    clonedNode.style.pointerEvents = 'none';
                    clonedNode.classList.add(CLONED_NODE_CLASSNAME);
                    ['top', 'left', 'width', 'height'].forEach(p => clonedNode.style[p] = rect[p] + 'px');
                    this.scrollSelectors.forEach(s => this.node.querySelector(`.${s}`) ? Array.from(clonedNode.querySelectorAll(`.${s}`)).forEach((e, i) => e.scrollTop = this.node.querySelectorAll(`.${s}`)[i].scrollTop) : null);

                    this.node = clonedNode;
                }

                animate(params = {}) {
                    if (this.animated || !this.node) return false;
                    this.animated = true;

                    params.duration = params.duration ?? 500;
                    params.easing = params.easing ?? Easing.easeOutQuart;
                    params.position = params.position ?? 'bottom';

                    const promise = this.animation(this.node, params);
                    promise.then(() => {this.end()});

                    return promise;
                }

                end() {
                    if (!this.needsCopy || !this.node) return;

                    this.node.remove();
                    this.node = null;
                }
            }

            return class BetterAnimations extends Plugin {
                onStart() {
                    this.patches();
                    this.injectCss();
                }

                patches() {
                    this.patchChannelActions();
                    this.patchPages();
                    this.patchGuildDiscovery();
                    this.patchSettingsView();
                    this.patchMessages();
                    this.patchPopouts();
                    this.patchExpressionPicker();
                }

                patchChannelActions() {
                    Patcher.before(ChannelActions, 'selectChannel', (self, params, value) => {
                        GuildIdHistory.push(params[0].guildId);
                    });
                }

                patchPages() {
                    let guildSwitched = null;

                    Patcher.before(RouteWithImpression.prototype, 'render', (self, _) => {
                        if (self.props.path === undefined || (typeof self.props.path === 'object' && self.props.path.length > 5)) return;

                        RoutePathHistory.push(typeof self.props.path === 'object' ? self.props.path[0] : self.props.path);
                        RouteLocationHistory.push(self.props.location.pathname);

                        if (RouteLocationHistory.current === RouteLocationHistory.previous) return;

                        const current = Routes.find(r => r.path.includes(RoutePathHistory.current));
                        const previous = Routes.find(r => r.path.includes(RoutePathHistory.previous ?? '/channels/@me'));
                        if (!current || !previous) return;

                        guildSwitched = current._guildSwitched || previous._guildSwitched;

                        if (guildSwitched && !this.settings.guild.enabled) return;
                        if (!guildSwitched && !this.settings.channel.enabled) return;

                        this.setMainAnimator(new ContainerAnimator(guildSwitched ? this.settings.guild.type : this.settings.channel.type, guildSwitched ? `.${Selectors.Layout.base}` : previous.element, previous.scrollers, {elementToAppear: guildSwitched ? `.${Selectors.Layout.base}` : current.element}));
                    });
                    Patcher.after(RouteWithImpression.prototype, 'render', (self, _, value) => {
                        if (self.props.path === undefined || (typeof self.props.path === 'object' && self.props.path.length > 5)) return;

                        const {duration, easing} = guildSwitched ? this.settings.guild : this.settings.channel;

                        this.animateMainAnimator({
                            duration,
                            easing: Easing[easing],
                            offset: 75,
                            scale: .1
                        });
                    });
                }

                setMainAnimator(animator) {
                    if (mainAnimator?.clonedNode) mainAnimator.forceEnd();
                    mainAnimator = animator;
                }

                animateMainAnimator(params) {
                    if (mainAnimator) mainAnimator.animate(params);
                }

                patchGuildDiscovery() {
                    let animator = null;

                    const before = (id) => {
                        if (!this.settings.settings.enabled) return;

                        if (animator?.clonedNode) animator.forceEnd();
                        animator = new ContainerAnimator(this.settings.channel.type, `.${Selectors.Pages.pageWrapper}, .${Selectors.StudentHubs.scroller}`, [Selectors.Content.scrollerBase], {
                            elementToAppear: `.${id === -2 ? Selectors.StudentHubs.scroller : Selectors.Pages.pageWrapper}`,
                        });
                    };

                    const after = () => {
                        if (animator) animator.animate({
                            duration: this.settings.channel.duration,
                            easing: Easing[this.settings.channel.easing],
                            offset: 75,
                            scale: .1
                        });
                    };

                    const selectCategory = getMangled(m => m?.toString && m.toString().includes('GUILD_DISCOVERY_SELECT_CATEGORY'));

                    Patcher.before(...selectCategory, (self, _) => {
                        GuildDiscoveryCategoryHistory.push(_[0]);

                        if (GuildDiscoveryCategoryHistory.current === GuildDiscoveryCategoryHistory.previous) return;

                        before(_[0]);
                    });
                    Patcher.after(...selectCategory, () => {
                        if (GuildDiscoveryCategoryHistory.current === GuildDiscoveryCategoryHistory.previous) return;

                        after();
                    });
                }

                patchSettingsView() {
                    let animator = null;

                    const before = (animatorOverride) => {
                        if (!this.settings.settings.enabled) return;

                        if (animator?.clonedNode) animator.forceEnd();
                        animator = animatorOverride ?? new ContainerAnimator(this.settings.settings.type, `.${Selectors.Sidebar.contentRegion}`, [Selectors.Sidebar.contentRegionScroller, Selectors.Settings.scroller, Selectors.Content.scrollerBase], {zIndex: 110});
                    };

                    const after = () => {
                        if (animator) animator.animate({
                            duration: this.settings.settings.duration,
                            easing: Easing[this.settings.settings.easing],
                            offset: 75,
                            scale: .1
                        });
                    };

                    const toggle = () => {
                        SettingsSectionHistory.push(null);
                    }

                    // All settings
                    [UserSettingsWindow, GuildSettingsWindow, ChannelSettingsWindow].forEach(w => {
                        Patcher.before(w, 'setSection', (self, _) => {
                            SettingsSectionHistory.push(_[0]);
                            GuildSettingsRoleIdHistory.push(null);

                            if (SettingsSectionHistory.current === SettingsSectionHistory.previous) return;

                            before();
                        });
                        Patcher.after(w, 'setSection', () => {
                            if (SettingsSectionHistory.current === SettingsSectionHistory.previous) return;

                            after();
                        });

                        Patcher.after(w, 'open', toggle);
                        Patcher.after(w, 'close', toggle);
                    });

                    // Guild Roles Settings
                    Patcher.before(GuildSettingsWindow, 'selectRole', (self, _) => {
                        GuildSettingsRoleIdHistory.push(_[0]);

                        if (GuildSettingsRoleIdHistory.current === GuildSettingsRoleIdHistory.previous) return;
                        before();
                    });
                    Patcher.after(GuildSettingsWindow, 'selectRole', () => {
                        if (GuildSettingsRoleIdHistory.current === GuildSettingsRoleIdHistory.previous) return;
                        after();
                    });

                    // Channel Integrations Settings
                    Patcher.before(ChannelIntegrationsSettingsWindow, 'setSection', (self, _) => {
                        ChannelIntegrationsSectionHistory.push(_[0]);

                        if (ChannelIntegrationsSectionHistory.current === ChannelIntegrationsSectionHistory.previous) return;
                        before();
                    });
                    Patcher.after(ChannelIntegrationsSettingsWindow, 'setSection', (self, _, value) => {
                        if (ChannelIntegrationsSectionHistory.current === ChannelIntegrationsSectionHistory.previous) return;
                        after();
                    });
                }

                patchMessages() {
                    const animateStack = new Set();
                    this.messageMutationObserver = new MutationObserver(records => {
                        records.forEach(r => r.addedNodes.forEach(n => {
                            const node = n.id?.startsWith('chat-message') ? n : (n.querySelector ? n.querySelector('*[id^="chat-message"]') : null);
                            if (!node) return;

                            const idSplit = node.id.split('-');
                            const id = idSplit[idSplit.length - 1];
                            if (!animateStack.has(id)) return;
                            animateStack.delete(id);

                            const messageNode = document.getElementById(node.id);
                            if (!messageNode) return;

                            messageNode.style.overflow = 'hidden';
                            messageNode.animate([
                                {height: 0, opacity: 0},
                                {height: messageNode.clientHeight+'px', opacity: 0}
                            ], {
                                duration: 250,
                                easing: Easing.easeInOut
                            }).finished.then(() => {
                                messageNode.style.overflow = '';

                                const animator = new RevealAnimator(this.settings.messages.type, messageNode);
                                animator.animate({
                                    duration: this.settings.messages.duration,
                                    easing: Easing[this.settings.messages.easing],
                                    offset: 10,
                                    scale: .1,
                                    position: this.settings.messages.position
                                });
                            });
                        }));
                    });
                    this.messageMutationObserver.observe(document, { childList: true, subtree: true });

                    this.messageCreateHandler = (e) => {
                        if (!this.settings.messages.enabled) return;

                        if (!e.message.id) return;

                        if (e.message.author.id === UserStore.getCurrentUser().id && e.message.state !== MessageStates.SENDING) return;

                        animateStack.add(e.message.id);
                        setTimeout(() => {
                            animateStack.delete(e.message.id);
                        }, 100);
                    };

                    Dispatcher.subscribe(ActionTypes.MESSAGE_CREATE, this.messageCreateHandler);
                }

                patchPopouts() {
                    const animate = (node, position) => {
                        const animator = new RevealAnimator(this.settings.popouts.type, node);
                        animator.animate({
                            duration: this.settings.popouts.duration,
                            easing: Easing[this.settings.popouts.easing],
                            offset: 10,
                            scale: .1,
                            position
                        });
                    };
                    let popoutNode = null;

                    Patcher.before(ReferencePositionLayer.prototype, 'componentDidMount', (self, _) => {
                        if (!this.settings.popouts.enabled) return;

                        const node = self.ref?.current ?? self.elementRef?.current ?? document.getElementById(self.props.id) ?? document.querySelector(`.${self.props.className}`);
                        if (!node) return;

                        popoutNode = node;
                        animate(node.children[0], self.props.position);
                    });
                    Patcher.before(ReferencePositionLayer.prototype, 'componentWillUnmount', (self, _) => {
                        if (!this.settings.popouts.enabled) return;

                        const node = self.ref?.current ?? self.elementRef?.current ?? document.getElementById(self.props.id) ?? document.querySelector(`.${self.props.className}`);
                        if (!node) return;

                        const animator = new RevealAnimator(this.settings.popouts.type, node, {
                            needsCopy: true,
                            scrollSelectors: [Selectors.Content.scrollerBase]
                        });
                        animator.animate({
                            reverse: true,
                            duration: this.settings.popouts.duration,
                            easing: Easing[this.settings.popouts.easing],
                            offset: 10,
                            scale: .1,
                            position: self.props.position
                        });
                    });

                    Patcher.before(UserPopout, 'type', (self, props) => {
                        if (!popoutNode || popoutNode.children[0]?.className.includes('loadingPopout')) return;
                        animate(popoutNode.children[0], props[0].position);

                        popoutNode = null;
                    })
                }

                patchExpressionPicker() {
                    const ExpressionPickerRoutes = [
                        new Route('Emoji', 'emoji', {
                            element: `.${Selectors.EmojiPicker.emojiPickerHasTabWrapper}`,
                            scrollers: [Selectors.Content.scrollerBase],
                            noGuilds: true
                        }),
                        new Route('Stickers', 'sticker', {
                            element: `.${Selectors.StickerPicker.wrapper}`,
                            scrollers: [Selectors.Content.scrollerBase],
                            noGuilds: true
                        }),
                        new Route('GIFs', 'gif', {
                            element: `.${Selectors.GifPicker.container}`,
                            scrollers: [Selectors.Content.scrollerBase],
                            noGuilds: true
                        }),
                    ];

                    let pickerAnimator = null;

                    const before = (view) => {
                        ExpressionPickerViewHistory.push(view);

                        if (ExpressionPickerViewHistory.current === ExpressionPickerViewHistory.previous) return;

                        const current = ExpressionPickerRoutes.find(r => r.path.includes(ExpressionPickerViewHistory.current));
                        const previous = ExpressionPickerRoutes.find(r => r.path.includes(ExpressionPickerViewHistory.previous));
                        if (!current || !previous) return;

                        if (!this.settings.expressionPicker.enabled) return;

                        if (pickerAnimator?.clonedNode) pickerAnimator.forceEnd();
                        pickerAnimator = new ContainerAnimator(this.settings.expressionPicker.type, previous.element, previous.scrollers, {elementToAppear: current.element});
                    };

                    const after = () => {
                        if (pickerAnimator) pickerAnimator.animate({
                            duration: this.settings.expressionPicker.duration,
                            easing: Easing[this.settings.expressionPicker.easing],
                            offset: 20,
                            scale: .1
                        });
                    };

                    const setExpressionPickerView = getMangled(m => m?.toString?.().match(/\w+\.setState\({activeView:\w+,lastActiveView:\w+\.getState\(\)\.activeView}\)/));
                    const toggleExpressionPicker = getMangled(m => m?.toString?.().match(/\w+\.getState\(\)\.activeView===\w+\?\w+\(\):\w+\(\w+,\w+\)/));

                    Patcher.before(...setExpressionPickerView, (self, _) => before(_[0]));
                    Patcher.before(...toggleExpressionPicker, (self, _) => before(_[0]));

                    Patcher.after(...setExpressionPickerView, after);
                    Patcher.after(...toggleExpressionPicker, after);
                }

                injectCss() {
                    this.PLUGIN_STYLE_ID = `${this.getName()}-style`;
                    DOM.addStyle(this.PLUGIN_STYLE_ID, `
                            .${PARENT_NODE_CLASSNAME} {
                                position: relative !important;
                            }
                    
                            /* Settings View Fix */
                            /* .${Selectors.Sidebar.standardSidebarView}, .${Selectors.Sidebar.contentRegionScroller} {
                                background: var(--background-tertiary) !important;
                            }

                            .${Selectors.Settings.contentContainer}, .${Selectors.SettingsSidebar.sidebar} {
                                background: var(--background-primary) !important;
                            } */

                            .${CLONED_NODE_CLASSNAME}.${Selectors.Sidebar.contentRegion} *, .${CLONED_NODE_CLASSNAME}.${Selectors.Settings.contentContainer} * {
                                box-sizing: border-box !important;
                            }


                            /* Disable Default Discord Animations */
                            ${RevealAnimator.getDiscordAnimationsSelector()} {
                                transition: none !important;
                            }


                            /* Expression Picker Fix */
                            .${Selectors.EmojiPicker.emojiPickerHasTabWrapper}, .${Selectors.StickerPicker.wrapper}, .${Selectors.GifPicker.container} {
                                background-color: inherit;
                            }
                            
                            
                            .${Selectors.Popout.layerContainer} {
                                position: fixed;
                            }


                            /* Settings */
                            .${SETTINGS_CLASSNAME} .plugin-inputs {
                                padding: 0 10px;
                            }
                        `);
                }

                clearCss() {
                    DOM.removeStyle(this.PLUGIN_STYLE_ID);
                }

                onStop() {
                    Dispatcher.unsubscribe(ActionTypes.MESSAGE_CREATE, this.messageCreateHandler);
                    this.messageMutationObserver?.disconnect();

                    Patcher.unpatchAll();
                    this.clearCss();
                }

                getSettingsPanel() {
                    const that = this;

                    const containerTypes = [
                        {
                            key: 'slipUp',
                            name: 'Slip Up'
                        },
                        {
                            key: 'slipDown',
                            name: 'Slip Down'
                        },
                        {
                            key: 'slipLeft',
                            name: 'Slip Left'
                        },
                        {
                            key: 'slipRight',
                            name: 'Slip Right'
                        },
                        {
                            key: 'slideUp',
                            name: 'Slide Up'
                        },
                        {
                            key: 'slideDown',
                            name: 'Slide Down'
                        },
                        {
                            key: 'slideLeft',
                            name: 'Slide Left'
                        },
                        {
                            key: 'slideRight',
                            name: 'Slide Right'
                        },
                        {
                            key: 'flipForwards',
                            name: 'Flip Forwards'
                        },
                        {
                            key: 'flipBackwards',
                            name: 'Flip Backwards'
                        },
                        {
                            key: 'flipLeft',
                            name: 'Flip Left'
                        },
                        {
                            key: 'flipRight',
                            name: 'Flip Right'
                        },
                        {
                            key: 'scaleUp',
                            name: 'Scale Up'
                        },
                        {
                            key: 'scaleDown',
                            name: 'Scale Down'
                        },
                        {
                            key: 'scaleLeft',
                            name: 'Scale Left'
                        },
                        {
                            key: 'scaleRight',
                            name: 'Scale Right'
                        },
                        {
                            key: 'fade',
                            name: 'Fade'
                        },
                        {
                            key: 'scaleForwards',
                            name: 'Scale Forwards'
                        },
                        {
                            key: 'scaleBackwards',
                            name: 'Scale Backwards'
                        },
                        {
                            key: 'scaleChange',
                            name: 'Scale Change'
                        },
                    ];

                    const revealTypes = [
                        {
                            key: 'fade',
                            name: 'Fade'
                        },
                        {
                            key: 'slip',
                            name: 'Slip'
                        },
                        {
                            key: 'slipScale',
                            name: 'Slip Scale'
                        },
                        {
                            key: 'flip',
                            name: 'Flip'
                        },
                        {
                            key: 'scaleForwards',
                            name: 'Scale Forwards'
                        },
                        {
                            key: 'scaleBackwards',
                            name: 'Scale Backwards'
                        },
                        {
                            key: 'scaleForwardsSide',
                            name: 'Scale Forwards Side-dependent'
                        },
                        {
                            key: 'scaleBackwardsSide',
                            name: 'Scale Backwards Side-dependent'
                        },
                        {
                            key: 'rotateForwardsLeft',
                            name: 'Rotate Forwards Left'
                        },
                        {
                            key: 'rotateForwardsRight',
                            name: 'Rotate Forwards Right'
                        },
                        {
                            key: 'rotateBackwardsLeft',
                            name: 'Rotate Backwards Left'
                        },
                        {
                            key: 'rotateBackwardsRight',
                            name: 'Rotate Backwards Right'
                        },
                    ];

                    const page = (num, title = null) => React.createElement(
                        'div',
                        {
                            style: {
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                height: '100%',
                                width: '100%',
                                background: `var(--background-${num === 2 ? 'tertiary' : 'accent'})`,
                                borderRadius: '5px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                color: 'var(--text-normal)',
                                fontSize: '12px',
                                opacity: 0
                            },
                            'data-page': num
                        },
                        title ?? `${num === 1 ? 'First' : 'Second'} page`
                    );

                    // Reveal Animation Example Component
                    class RevealAnimationExample extends React.Component {
                        constructor(props) {
                            super(props);

                            this.ref = React.createRef();
                        }

                        componentDidMount() {
                            const animate = () => {
                                if (!this.ref.current) return;

                                const node = this.ref.current.querySelector('[data-page="1"]');

                                const params = {
                                    duration: this.props.getOption().duration,
                                    easing: Easing[this.props.getOption().easing],
                                    offset: 10,
                                    scale: .15,
                                    position: this.props.getOption().position ?? ['top', 'left', 'right', 'bottom'][Math.round(Math.random() * 3)]
                                };

                                node.style.opacity = 1;
                                this.props.animation(node, params).then(() => {
                                    setTimeout(() => {
                                        if (!this.ref.current) return;

                                        node.style.opacity = 0;
                                        this.props.animation(node, Object.assign(params, {reverse: true}))
                                        .then(() => {
                                            setTimeout(() => animate(), 1000);
                                        })
                                    }, 1000);
                                });
                            };

                            animate();
                        }

                        render() {
                            return React.createElement(
                                'div',
                                {
                                    className: Selectors.Sticker.sticker,
                                    style: {
                                        width: '90px',
                                        height: '60px',
                                        marginBottom: '15px',
                                        position: 'relative',
                                        borderRadius: '5px'
                                    },
                                    ref: this.ref
                                },
                                [
                                    page(1, '')
                                ]
                            );
                        }
                    }

                    // Container Animation Example Component
                    class ContainerAnimationExample extends React.Component {
                        constructor(props) {
                            super(props);

                            this.ref = React.createRef();

                            this.state = {
                                page: 0
                            };
                        }

                        componentDidMount() {
                            const animate = () => {
                                if (!this.ref.current) return;

                                this.setState({
                                    page: Math.abs(this.state.page - 1)
                                });

                                const node = this.ref.current;
                                const pages = [node.querySelector('[data-page="1"]'), node.querySelector('[data-page="2"]')];

                                const page = Math.abs(this.state.page - 1);

                                pages.forEach(p => p.style.opacity = 1);
                                pages[page].style.zIndex = 5;

                                this.props.animation(pages[this.state.page], pages[page], {
                                    duration: this.props.getOption().duration,
                                    easing: Easing[this.props.getOption().easing],
                                    offset: 10,
                                    scale: .3,
                                    zIndex: 5
                                }).then(() => {
                                    pages[page].style.zIndex = 1;
                                    pages[page].style.opacity = 0;

                                    setTimeout(() => animate(), 1000);
                                });
                            };

                            this.ref.current.querySelector(`[data-page="${this.state.page + 1}"]`).style.opacity = 1;
                            setTimeout(() => animate(), 1000);
                        }

                        render() {
                            return React.createElement(
                                'div',
                                {
                                    className: Selectors.Sticker.sticker,
                                    style: {
                                        width: '90px',
                                        height: '60px',
                                        marginBottom: '15px',
                                        position: 'relative',
                                        borderRadius: '5px',
                                        overflow: 'hidden'
                                    },
                                    ref: this.ref
                                },
                                [
                                    page(2),
                                    page(1)
                                ]
                            );
                        }
                    }

                    const AnimationTypes = (types, animations, component, getOption) => {
                        // Item Component
                        class Item extends React.Component {
                            constructor(props) {
                                super(props);
                            }

                            render() {
                                return React.createElement(
                                    'div',
                                    {
                                        className: Selectors.Sticker.wrapper,
                                        style: {
                                            cursor: 'pointer'
                                        },
                                        onClick: () => this.props.onClick(this.props.type.key)
                                    },
                                    [
                                        React.createElement(
                                            'div',
                                            {
                                                className: Selectors.Sticker.content,
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center'
                                                }
                                            },
                                            [
                                                React.createElement(
                                                    component,
                                                    {
                                                        animation: this.props.animations[this.props.type.key],
                                                        getOption
                                                    }
                                                ),
                                                React.createElement(
                                                    'div',
                                                    {
                                                        className: `${Selectors.Colors.colorHeaderPrimary} ${Selectors.Sizes.size10} ${Selectors.Sticker.stickerName}`,
                                                        style: {
                                                            height: '12px'
                                                        }
                                                    },
                                                    this.props.type.name
                                                )
                                            ]
                                        ),
                                        React.createElement(
                                            'div',
                                            {
                                                className: Selectors.VideoOptions.backgroundOptionRing,
                                                style: {
                                                    display: this.props.type.selected ? 'block' : 'none',
                                                    borderRadius: '10px'
                                                }
                                            }
                                        )
                                    ]
                                )
                            }
                        }

                        // Panel Component
                        class Panel extends React.Component {
                            constructor(props) {
                                super(props);

                                this.state = {
                                    types: types.map(t => Object.assign(t, {selected: t.key === getOption().type}))
                                }
                            }

                            render() {
                                let buttons = [];
                                this.state.types.forEach(t => {
                                    buttons.push(
                                        React.createElement(Item, {
                                            type: t,
                                            animations: animations,
                                            onClick: key => {
                                                getOption().type = key;

                                                const types = this.state.types;
                                                types.forEach(t => t.selected = false);
                                                types.find(t => t.key === key).selected = true;
                                                this.setState({types});

                                                that.saveSettings();
                                            }
                                        })
                                    );
                                });

                                return React.createElement(
                                    'div',
                                    {
                                        className: Selectors.Stickers.grid,
                                        style: {
                                            gridTemplateColumns: 'repeat(4, 1fr)',
                                            gridTemplateRows: '120px',
                                            gridAutoRows: '120px'
                                        }
                                    },
                                    buttons
                                );
                            }
                        }

                        return Panel;
                    };

                    const Buttons = (...props) => {
                        // Panel Component
                        class Panel extends React.Component {
                            render() {
                                let buttons = [];
                                props.forEach(p => {
                                    buttons.push(
                                        React.createElement(Button, {
                                            style: {
                                                display: 'inline-flex',
                                                marginRight: '10px'
                                            },
                                            ...p
                                        })
                                    );
                                });

                                return React.createElement(
                                    'div',
                                    {},
                                    buttons
                                );
                            }
                        }

                        return Panel;
                    }

                    const markers = (start, stop, step = 1) =>
                        Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step);

                    const easings = Object.keys(Easing).map(e => {
                        return {
                            label: e.charAt(0).toUpperCase() + e.slice(1),
                            value: e
                        };
                    });

                    const positions = [
                        {label: 'Top', value: 'bottom'},
                        {label: 'Bottom', value: 'top'},
                        {label: 'Left', value: 'right'},
                        {label: 'Right', value: 'left'}
                    ];

                    const element = Settings.SettingPanel.build(
                        () => {
                            this.saveSettings.bind(this);
                        },

                        new Settings.SettingField(null, null, () => {}, Buttons(
                            {
                                children: 'Check for updates',
                                color: Button.Colors.BRAND,
                                size: Button.Sizes.SMALL,
                                onClick: () => this.checkForUpdates()
                            },
                            {
                                children: 'Reset settings to default',
                                color: Button.Colors.TRANSPARENT,
                                size: Button.Sizes.SMALL,
                                onClick: () => {
                                    this.settings = this.defaultSettings;
                                    this.saveSettings();
                                    this.closeSettings();

                                    Toasts.success(`Plugin settings have been reset to defaults`);
                                }
                            },
                        )),

                        // new Settings.SettingField(null, React.createElement(DiscordModules.TextElement, {
                        //     children: [
                        //         'Not your language? Help translate the plugin on the ',
                        //         React.createElement(Anchor, {
                        //             children: 'Crowdin page',
                        //             href: 'https://crwd.in/betterdiscord-betteranimations'
                        //         }),
                        //         '.'
                        //     ],
                        //     className: `${DiscordModules.TextElement.Colors.STANDARD} ${DiscordModules.TextElement.Sizes.SIZE_14}`
                        // }), () => {}, document.createElement('div')),

                        // Guild section
                        new Settings.SettingGroup('Guild Animations').append(

                            new Settings.Switch('Enable guild switching animation', null, this.settings.guild.enabled, e => {
                                this.settings.guild.enabled = e;
                                this.saveSettings();
                            }),

                            new Settings.SettingField('Animation type', null, () => {}, AnimationTypes(containerTypes, ContainerAnimator.TYPES, ContainerAnimationExample, () => this.settings.guild)),

                            new Settings.Dropdown('Easing', 'Easing functions can be viewed at www.easings.net', this.settings.guild.easing, easings, e => {
                                this.settings.guild.easing = e;
                                this.saveSettings();
                            }),

                            new Settings.Slider('Duration', null, 100, 5000, this.settings.guild.duration, e => {
                                this.settings.guild.duration = e;
                                this.saveSettings();
                            }, {
                                markers: markers(100, 5001, 100),
                                stickToMarkers: true,
                                renderMarker: v => v%500 === 0 || v === 100 ? (v / 1000).toFixed(1) + 's' : ''
                            })

                        ),

                        // Channel section
                        new Settings.SettingGroup('Channel Animations').append(

                            new Settings.Switch('Enable channel switching animation', null, this.settings.channel.enabled, e => {
                                this.settings.channel.enabled = e;
                                this.saveSettings();
                            }),

                            new Settings.SettingField('Animation type', null, () => {}, AnimationTypes(containerTypes, ContainerAnimator.TYPES, ContainerAnimationExample, () => this.settings.channel)),

                            new Settings.Dropdown('Easing', 'Easing functions can be viewed at www.easings.net', this.settings.channel.easing, easings, e => {
                                this.settings.channel.easing = e;
                                this.saveSettings();
                            }),

                            new Settings.Slider('Duration', null, 100, 5000, this.settings.channel.duration, e => {
                                this.settings.channel.duration = e;
                                this.saveSettings();
                            }, {
                                markers: markers(100, 5001, 100),
                                stickToMarkers: true,
                                renderMarker: v => v%500 === 0 || v === 100 ? (v / 1000).toFixed(1) + 's' : ''
                            })

                        ),

                        // Settings section
                        new Settings.SettingGroup('Settings Animations').append(

                            new Settings.Switch('Enable settings sections switching animation', null, this.settings.settings.enabled, e => {
                                this.settings.settings.enabled = e;
                                this.saveSettings();
                            }),

                            new Settings.SettingField('Animation type', null, () => {}, AnimationTypes(containerTypes, ContainerAnimator.TYPES, ContainerAnimationExample, () => this.settings.settings)),

                            new Settings.Dropdown('Easing', 'Easing functions can be viewed at www.easings.net', this.settings.settings.easing, easings, e => {
                                this.settings.settings.easing = e;
                                this.saveSettings();
                            }),

                            new Settings.Slider('Duration', null, 100, 5000, this.settings.settings.duration, e => {
                                this.settings.settings.duration = e;
                                this.saveSettings();
                            }, {
                                markers: markers(100, 5001, 100),
                                stickToMarkers: true,
                                renderMarker: v => v%500 === 0 || v === 100 ? (v / 1000).toFixed(1) + 's' : ''
                            })

                        ),

                        // Messages section
                        new Settings.SettingGroup('Messages Animations').append(

                            new Settings.Switch('Enable new message reveal animation', null, this.settings.messages.enabled, e => {
                                this.settings.messages.enabled = e;
                                this.saveSettings();
                            }),

                            new Settings.SettingField('Animation type', null, () => {}, AnimationTypes(revealTypes, RevealAnimator.TYPES, RevealAnimationExample, () => this.settings.messages)),

                            new Settings.Dropdown('Side', 'Sets the side for side-dependent animations.', this.settings.messages.position, positions, e => {
                                this.settings.messages.position = e;
                                this.saveSettings();
                            }),

                            new Settings.Dropdown('Easing', 'Easing functions can be viewed at www.easings.net', this.settings.messages.easing, easings, e => {
                                this.settings.messages.easing = e;
                                this.saveSettings();
                            }),

                            new Settings.Slider('Duration', null, 100, 5000, this.settings.messages.duration, e => {
                                this.settings.messages.duration = e;
                                this.saveSettings();
                            }, {
                                markers: markers(100, 5001, 100),
                                stickToMarkers: true,
                                renderMarker: v => v%500 === 0 || v === 100 ? (v / 1000).toFixed(1) + 's' : ''
                            })

                        ),

                        // Popouts section
                        new Settings.SettingGroup('Popouts, Context Menus and Tooltips Animations').append(

                            new Settings.Switch('Enable popouts, context menus and tooltips animations', null, this.settings.popouts.enabled, e => {
                                this.settings.popouts.enabled = e;
                                this.saveSettings();
                            }),

                            new Settings.SettingField('Animation type', null, () => {}, AnimationTypes(revealTypes, RevealAnimator.TYPES, RevealAnimationExample, () => this.settings.popouts)),

                            new Settings.Dropdown('Easing', 'Easing functions can be viewed at www.easings.net', this.settings.popouts.easing, easings, e => {
                                this.settings.popouts.easing = e;
                                this.saveSettings();
                            }),

                            new Settings.Slider('Duration', null, 100, 5000, this.settings.popouts.duration, e => {
                                this.settings.popouts.duration = e;
                                this.saveSettings();
                            }, {
                                markers: markers(100, 5001, 100),
                                stickToMarkers: true,
                                renderMarker: v => v%500 === 0 || v === 100 ? (v / 1000).toFixed(1) + 's' : ''
                            })

                        ),

                        // Expression Picker section
                        new Settings.SettingGroup('Expression Picker Animations').append(

                            new Settings.Switch('Enable expression picker sections switching animation', null, this.settings.expressionPicker.enabled, e => {
                                this.settings.expressionPicker.enabled = e;
                                this.saveSettings();
                            }),

                            new Settings.SettingField('Animation type', null, () => {}, AnimationTypes(containerTypes, ContainerAnimator.TYPES, ContainerAnimationExample, () => this.settings.expressionPicker)),

                            new Settings.Dropdown('Easing', 'Easing functions can be viewed at www.easings.net', this.settings.expressionPicker.easing, easings, e => {
                                this.settings.expressionPicker.easing = e;
                                this.saveSettings();
                            }),

                            new Settings.Slider('Duration', null, 100, 5000, this.settings.expressionPicker.duration, e => {
                                this.settings.expressionPicker.duration = e;
                                this.saveSettings();
                            }, {
                                markers: markers(100, 5001, 100),
                                stickToMarkers: true,
                                renderMarker: v => v%500 === 0 || v === 100 ? (v / 1000).toFixed(1) + 's' : ''
                            })

                        )

                    );

                    element.classList.add(SETTINGS_CLASSNAME);

                    return element;
                }

                closeSettings() {
                    document.querySelector('.bd-addon-modal-footer > .bd-button').click();
                }

                constructor() {
                    super();

                    this.defaultSettings = {
                        guild: {
                            enabled: true,
                            type: 'flipForwards',
                            easing: 'easeInOutCubic',
                            duration: 700
                        },
                        channel: {
                            enabled: true,
                            type: 'slipUp',
                            easing: 'easeInOutCubic',
                            duration: 500
                        },
                        settings: {
                            enabled: true,
                            type: 'slipUp',
                            easing: 'easeInOutCubic',
                            duration: 500
                        },
                        messages: {
                            enabled: true,
                            type: 'slip',
                            easing: 'easeOutQuart',
                            position: 'bottom',
                            duration: 200
                        },
                        popouts: {
                            enabled: true,
                            type: 'rotateBackwardsLeft',
                            easing: 'easeInOutBack',
                            duration: 300
                        },
                        expressionPicker: {
                            enabled: true,
                            type: 'scaleChange',
                            easing: 'easeInOutBack',
                            duration: 500
                        },
                    }

                    this.settings = this.loadSettings(this.defaultSettings);
                }

                checkForUpdates() {
                    PluginUpdater.hasUpdate(config.info.github_raw)
                        .then(hasUpdate => {
                            if (hasUpdate) return Toasts.info('Plugin update has been found');

                            Toasts.success('Plugin is up to date');
                        })
                }
            }
        }

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
