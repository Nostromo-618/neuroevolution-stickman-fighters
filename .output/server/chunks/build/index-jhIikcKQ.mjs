import { b as _sfc_main$8$1, h as _sfc_main$d$1, c as useLocale, d as useAppConfig, e as usePortal, t as tv, f as useFieldGroup, g as useComponentIcons, i as _sfc_main$b$1, j as useFormField } from './server.mjs';
import { defineComponent, ref, unref, watch, mergeProps, withCtx, createTextVNode, createVNode, watchEffect, computed, toDisplayString, createBlock, createCommentVNode, openBlock, useSlots, toRef, toHandlers, renderSlot, Fragment, renderList, mergeModels, useModel, useId, reactive, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrRenderSlot, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
import { useForwardPropsEmits, DialogRoot, DialogContent, VisuallyHidden, DialogTitle, DialogDescription, DialogClose, DialogTrigger, DialogPortal, DialogOverlay, Primitive, useForwardProps, SwitchRoot, SwitchThumb, Label, SliderRoot, SliderTrack, SliderRange, SliderThumb, TooltipRoot, TooltipTrigger, TooltipPortal, TooltipContent, TooltipArrow } from 'reka-ui';
import { reactivePick, createReusableTemplate, createSharedComposable } from '@vueuse/core';
import { k as defu } from '../nitro/nitro.mjs';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';

const _sfc_main$m = /* @__PURE__ */ defineComponent({
  __name: "GoodbyeScreen",
  __ssrInlineRender: true,
  props: {
    onReturn: { type: Function }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700" }, _attrs))}><div class="max-w-md w-full space-y-8"><div class="space-y-4"><div class="inline-block p-4 rounded-full bg-slate-900 border border-slate-700 mb-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2 2m-2-2v6m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><h1 class="text-4xl font-extrabold tracking-tight text-white mb-2"> Farewell </h1><p class="text-slate-400 text-lg leading-relaxed"> We&#39;re sorry to see you go. To protect both you and the project, accepting the disclaimer is required to use this application. </p></div><div class="pt-8 space-y-4"><p class="text-slate-500 text-sm"> Changed your mind? You can always return and review the terms again. </p>`);
      _push(ssrRenderComponent(_component_UButton, {
        onClick: __props.onReturn,
        color: "success",
        variant: "outline",
        size: "lg"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Return to Disclaimer `);
          } else {
            return [
              createTextVNode(" Return to Disclaimer ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="pt-12"><p class="text-slate-600 text-xs"> © 2025 NeuroEvolution: Stickman Fighters Team </p></div></div></div>`);
    };
  }
});
const _sfc_setup$m = _sfc_main$m.setup;
_sfc_main$m.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/GoodbyeScreen.vue");
  return _sfc_setup$m ? _sfc_setup$m(props, ctx) : void 0;
};
const __nuxt_component_0$2 = Object.assign(_sfc_main$m, { __name: "GoodbyeScreen" });
const theme$6 = {
  "slots": {
    "overlay": "fixed inset-0",
    "content": "bg-default divide-y divide-default flex flex-col focus:outline-none",
    "header": "flex items-center gap-1.5 p-4 sm:px-6 min-h-16",
    "wrapper": "",
    "body": "flex-1 p-4 sm:p-6",
    "footer": "flex items-center gap-1.5 p-4 sm:px-6",
    "title": "text-highlighted font-semibold",
    "description": "mt-1 text-muted text-sm",
    "close": "absolute top-4 end-4"
  },
  "variants": {
    "transition": {
      "true": {
        "overlay": "data-[state=open]:animate-[fade-in_200ms_ease-out] data-[state=closed]:animate-[fade-out_200ms_ease-in]",
        "content": "data-[state=open]:animate-[scale-in_200ms_ease-out] data-[state=closed]:animate-[scale-out_200ms_ease-in]"
      }
    },
    "fullscreen": {
      "true": {
        "content": "inset-0"
      },
      "false": {
        "content": "w-[calc(100vw-2rem)] max-w-lg rounded-lg shadow-lg ring ring-default"
      }
    },
    "overlay": {
      "true": {
        "overlay": "bg-elevated/75"
      }
    },
    "scrollable": {
      "true": {
        "overlay": "overflow-y-auto",
        "content": "relative"
      },
      "false": {
        "content": "fixed",
        "body": "overflow-y-auto"
      }
    }
  },
  "compoundVariants": [
    {
      "scrollable": true,
      "fullscreen": false,
      "class": {
        "overlay": "grid place-items-center p-4 sm:py-8"
      }
    },
    {
      "scrollable": false,
      "fullscreen": false,
      "class": {
        "content": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] overflow-hidden"
      }
    }
  ]
};
const _sfc_main$l = {
  __name: "UModal",
  __ssrInlineRender: true,
  props: {
    title: { type: String, required: false },
    description: { type: String, required: false },
    content: { type: Object, required: false },
    overlay: { type: Boolean, required: false, default: true },
    scrollable: { type: Boolean, required: false },
    transition: { type: Boolean, required: false, default: true },
    fullscreen: { type: Boolean, required: false },
    portal: { type: [Boolean, String], required: false, skipCheck: true, default: true },
    close: { type: [Boolean, Object], required: false, default: true },
    closeIcon: { type: null, required: false },
    dismissible: { type: Boolean, required: false, default: true },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    open: { type: Boolean, required: false },
    defaultOpen: { type: Boolean, required: false },
    modal: { type: Boolean, required: false, default: true }
  },
  emits: ["after:leave", "after:enter", "close:prevent", "update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const { t } = useLocale();
    const appConfig = useAppConfig();
    const rootProps = useForwardPropsEmits(reactivePick(props, "open", "defaultOpen", "modal"), emits);
    const portalProps = usePortal(toRef(() => props.portal));
    const contentProps = toRef(() => props.content);
    const contentEvents = computed(() => {
      if (!props.dismissible) {
        const events = ["pointerDownOutside", "interactOutside", "escapeKeyDown"];
        return events.reduce((acc, curr) => {
          acc[curr] = (e) => {
            e.preventDefault();
            emits("close:prevent");
          };
          return acc;
        }, {});
      }
      if (props.scrollable) {
        return {
          // FIXME: This is a workaround to prevent the modal from closing when clicking on the scrollbar https://reka-ui.com/docs/components/dialog#scrollable-overlay but it's not working on Mac OS.
          pointerDownOutside: (e) => {
            const originalEvent = e.detail.originalEvent;
            const target = originalEvent.target;
            if (originalEvent.offsetX > target.clientWidth || originalEvent.offsetY > target.clientHeight) {
              e.preventDefault();
            }
          }
        };
      }
      return {};
    });
    const [DefineContentTemplate, ReuseContentTemplate] = createReusableTemplate();
    const ui = computed(() => tv({ extend: tv(theme$6), ...appConfig.ui?.modal || {} })({
      transition: props.transition,
      fullscreen: props.fullscreen,
      overlay: props.overlay,
      scrollable: props.scrollable
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DialogRoot), mergeProps(unref(rootProps), _attrs), {
        default: withCtx(({ open, close }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(DefineContentTemplate), null, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(DialogContent), mergeProps({
                    "data-slot": "content",
                    class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                  }, contentProps.value, {
                    onAfterEnter: ($event) => emits("after:enter"),
                    onAfterLeave: ($event) => emits("after:leave")
                  }, toHandlers(contentEvents.value)), {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (!!slots.content && (__props.title || !!slots.title || (__props.description || !!slots.description))) {
                          _push4(ssrRenderComponent(unref(VisuallyHidden), null, {
                            default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                if (__props.title || !!slots.title) {
                                  _push5(ssrRenderComponent(unref(DialogTitle), null, {
                                    default: withCtx((_4, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        ssrRenderSlot(_ctx.$slots, "title", {}, () => {
                                          _push6(`${ssrInterpolate(__props.title)}`);
                                        }, _push6, _parent6, _scopeId5);
                                      } else {
                                        return [
                                          renderSlot(_ctx.$slots, "title", {}, () => [
                                            createTextVNode(toDisplayString(__props.title), 1)
                                          ])
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                } else {
                                  _push5(`<!---->`);
                                }
                                if (__props.description || !!slots.description) {
                                  _push5(ssrRenderComponent(unref(DialogDescription), null, {
                                    default: withCtx((_4, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        ssrRenderSlot(_ctx.$slots, "description", {}, () => {
                                          _push6(`${ssrInterpolate(__props.description)}`);
                                        }, _push6, _parent6, _scopeId5);
                                      } else {
                                        return [
                                          renderSlot(_ctx.$slots, "description", {}, () => [
                                            createTextVNode(toDisplayString(__props.description), 1)
                                          ])
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                } else {
                                  _push5(`<!---->`);
                                }
                              } else {
                                return [
                                  __props.title || !!slots.title ? (openBlock(), createBlock(unref(DialogTitle), { key: 0 }, {
                                    default: withCtx(() => [
                                      renderSlot(_ctx.$slots, "title", {}, () => [
                                        createTextVNode(toDisplayString(__props.title), 1)
                                      ])
                                    ]),
                                    _: 3
                                  })) : createCommentVNode("", true),
                                  __props.description || !!slots.description ? (openBlock(), createBlock(unref(DialogDescription), { key: 1 }, {
                                    default: withCtx(() => [
                                      renderSlot(_ctx.$slots, "description", {}, () => [
                                        createTextVNode(toDisplayString(__props.description), 1)
                                      ])
                                    ]),
                                    _: 3
                                  })) : createCommentVNode("", true)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                        ssrRenderSlot(_ctx.$slots, "content", { close }, () => {
                          if (!!slots.header || (__props.title || !!slots.title) || (__props.description || !!slots.description) || (props.close || !!slots.close)) {
                            _push4(`<div data-slot="header" class="${ssrRenderClass(ui.value.header({ class: props.ui?.header }))}"${_scopeId3}>`);
                            ssrRenderSlot(_ctx.$slots, "header", { close }, () => {
                              _push4(`<div data-slot="wrapper" class="${ssrRenderClass(ui.value.wrapper({ class: props.ui?.wrapper }))}"${_scopeId3}>`);
                              if (__props.title || !!slots.title) {
                                _push4(ssrRenderComponent(unref(DialogTitle), {
                                  "data-slot": "title",
                                  class: ui.value.title({ class: props.ui?.title })
                                }, {
                                  default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                                    if (_push5) {
                                      ssrRenderSlot(_ctx.$slots, "title", {}, () => {
                                        _push5(`${ssrInterpolate(__props.title)}`);
                                      }, _push5, _parent5, _scopeId4);
                                    } else {
                                      return [
                                        renderSlot(_ctx.$slots, "title", {}, () => [
                                          createTextVNode(toDisplayString(__props.title), 1)
                                        ])
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent4, _scopeId3));
                              } else {
                                _push4(`<!---->`);
                              }
                              if (__props.description || !!slots.description) {
                                _push4(ssrRenderComponent(unref(DialogDescription), {
                                  "data-slot": "description",
                                  class: ui.value.description({ class: props.ui?.description })
                                }, {
                                  default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                                    if (_push5) {
                                      ssrRenderSlot(_ctx.$slots, "description", {}, () => {
                                        _push5(`${ssrInterpolate(__props.description)}`);
                                      }, _push5, _parent5, _scopeId4);
                                    } else {
                                      return [
                                        renderSlot(_ctx.$slots, "description", {}, () => [
                                          createTextVNode(toDisplayString(__props.description), 1)
                                        ])
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent4, _scopeId3));
                              } else {
                                _push4(`<!---->`);
                              }
                              _push4(`</div>`);
                              ssrRenderSlot(_ctx.$slots, "actions", {}, null, _push4, _parent4, _scopeId3);
                              if (props.close || !!slots.close) {
                                _push4(ssrRenderComponent(unref(DialogClose), { "as-child": "" }, {
                                  default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                                    if (_push5) {
                                      ssrRenderSlot(_ctx.$slots, "close", { ui: ui.value }, () => {
                                        if (props.close) {
                                          _push5(ssrRenderComponent(_sfc_main$8$1, mergeProps({
                                            icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                                            color: "neutral",
                                            variant: "ghost",
                                            "aria-label": unref(t)("modal.close")
                                          }, typeof props.close === "object" ? props.close : {}, {
                                            "data-slot": "close",
                                            class: ui.value.close({ class: props.ui?.close })
                                          }), null, _parent5, _scopeId4));
                                        } else {
                                          _push5(`<!---->`);
                                        }
                                      }, _push5, _parent5, _scopeId4);
                                    } else {
                                      return [
                                        renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => [
                                          props.close ? (openBlock(), createBlock(_sfc_main$8$1, mergeProps({
                                            key: 0,
                                            icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                                            color: "neutral",
                                            variant: "ghost",
                                            "aria-label": unref(t)("modal.close")
                                          }, typeof props.close === "object" ? props.close : {}, {
                                            "data-slot": "close",
                                            class: ui.value.close({ class: props.ui?.close })
                                          }), null, 16, ["icon", "aria-label", "class"])) : createCommentVNode("", true)
                                        ])
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent4, _scopeId3));
                              } else {
                                _push4(`<!---->`);
                              }
                            }, _push4, _parent4, _scopeId3);
                            _push4(`</div>`);
                          } else {
                            _push4(`<!---->`);
                          }
                          if (!!slots.body) {
                            _push4(`<div data-slot="body" class="${ssrRenderClass(ui.value.body({ class: props.ui?.body }))}"${_scopeId3}>`);
                            ssrRenderSlot(_ctx.$slots, "body", { close }, null, _push4, _parent4, _scopeId3);
                            _push4(`</div>`);
                          } else {
                            _push4(`<!---->`);
                          }
                          if (!!slots.footer) {
                            _push4(`<div data-slot="footer" class="${ssrRenderClass(ui.value.footer({ class: props.ui?.footer }))}"${_scopeId3}>`);
                            ssrRenderSlot(_ctx.$slots, "footer", { close }, null, _push4, _parent4, _scopeId3);
                            _push4(`</div>`);
                          } else {
                            _push4(`<!---->`);
                          }
                        }, _push4, _parent4, _scopeId3);
                      } else {
                        return [
                          !!slots.content && (__props.title || !!slots.title || (__props.description || !!slots.description)) ? (openBlock(), createBlock(unref(VisuallyHidden), { key: 0 }, {
                            default: withCtx(() => [
                              __props.title || !!slots.title ? (openBlock(), createBlock(unref(DialogTitle), { key: 0 }, {
                                default: withCtx(() => [
                                  renderSlot(_ctx.$slots, "title", {}, () => [
                                    createTextVNode(toDisplayString(__props.title), 1)
                                  ])
                                ]),
                                _: 3
                              })) : createCommentVNode("", true),
                              __props.description || !!slots.description ? (openBlock(), createBlock(unref(DialogDescription), { key: 1 }, {
                                default: withCtx(() => [
                                  renderSlot(_ctx.$slots, "description", {}, () => [
                                    createTextVNode(toDisplayString(__props.description), 1)
                                  ])
                                ]),
                                _: 3
                              })) : createCommentVNode("", true)
                            ]),
                            _: 3
                          })) : createCommentVNode("", true),
                          renderSlot(_ctx.$slots, "content", { close }, () => [
                            !!slots.header || (__props.title || !!slots.title) || (__props.description || !!slots.description) || (props.close || !!slots.close) ? (openBlock(), createBlock("div", {
                              key: 0,
                              "data-slot": "header",
                              class: ui.value.header({ class: props.ui?.header })
                            }, [
                              renderSlot(_ctx.$slots, "header", { close }, () => [
                                createVNode("div", {
                                  "data-slot": "wrapper",
                                  class: ui.value.wrapper({ class: props.ui?.wrapper })
                                }, [
                                  __props.title || !!slots.title ? (openBlock(), createBlock(unref(DialogTitle), {
                                    key: 0,
                                    "data-slot": "title",
                                    class: ui.value.title({ class: props.ui?.title })
                                  }, {
                                    default: withCtx(() => [
                                      renderSlot(_ctx.$slots, "title", {}, () => [
                                        createTextVNode(toDisplayString(__props.title), 1)
                                      ])
                                    ]),
                                    _: 3
                                  }, 8, ["class"])) : createCommentVNode("", true),
                                  __props.description || !!slots.description ? (openBlock(), createBlock(unref(DialogDescription), {
                                    key: 1,
                                    "data-slot": "description",
                                    class: ui.value.description({ class: props.ui?.description })
                                  }, {
                                    default: withCtx(() => [
                                      renderSlot(_ctx.$slots, "description", {}, () => [
                                        createTextVNode(toDisplayString(__props.description), 1)
                                      ])
                                    ]),
                                    _: 3
                                  }, 8, ["class"])) : createCommentVNode("", true)
                                ], 2),
                                renderSlot(_ctx.$slots, "actions"),
                                props.close || !!slots.close ? (openBlock(), createBlock(unref(DialogClose), {
                                  key: 0,
                                  "as-child": ""
                                }, {
                                  default: withCtx(() => [
                                    renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => [
                                      props.close ? (openBlock(), createBlock(_sfc_main$8$1, mergeProps({
                                        key: 0,
                                        icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                                        color: "neutral",
                                        variant: "ghost",
                                        "aria-label": unref(t)("modal.close")
                                      }, typeof props.close === "object" ? props.close : {}, {
                                        "data-slot": "close",
                                        class: ui.value.close({ class: props.ui?.close })
                                      }), null, 16, ["icon", "aria-label", "class"])) : createCommentVNode("", true)
                                    ])
                                  ]),
                                  _: 2
                                }, 1024)) : createCommentVNode("", true)
                              ])
                            ], 2)) : createCommentVNode("", true),
                            !!slots.body ? (openBlock(), createBlock("div", {
                              key: 1,
                              "data-slot": "body",
                              class: ui.value.body({ class: props.ui?.body })
                            }, [
                              renderSlot(_ctx.$slots, "body", { close })
                            ], 2)) : createCommentVNode("", true),
                            !!slots.footer ? (openBlock(), createBlock("div", {
                              key: 2,
                              "data-slot": "footer",
                              class: ui.value.footer({ class: props.ui?.footer })
                            }, [
                              renderSlot(_ctx.$slots, "footer", { close })
                            ], 2)) : createCommentVNode("", true)
                          ])
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(DialogContent), mergeProps({
                      "data-slot": "content",
                      class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                    }, contentProps.value, {
                      onAfterEnter: ($event) => emits("after:enter"),
                      onAfterLeave: ($event) => emits("after:leave")
                    }, toHandlers(contentEvents.value)), {
                      default: withCtx(() => [
                        !!slots.content && (__props.title || !!slots.title || (__props.description || !!slots.description)) ? (openBlock(), createBlock(unref(VisuallyHidden), { key: 0 }, {
                          default: withCtx(() => [
                            __props.title || !!slots.title ? (openBlock(), createBlock(unref(DialogTitle), { key: 0 }, {
                              default: withCtx(() => [
                                renderSlot(_ctx.$slots, "title", {}, () => [
                                  createTextVNode(toDisplayString(__props.title), 1)
                                ])
                              ]),
                              _: 3
                            })) : createCommentVNode("", true),
                            __props.description || !!slots.description ? (openBlock(), createBlock(unref(DialogDescription), { key: 1 }, {
                              default: withCtx(() => [
                                renderSlot(_ctx.$slots, "description", {}, () => [
                                  createTextVNode(toDisplayString(__props.description), 1)
                                ])
                              ]),
                              _: 3
                            })) : createCommentVNode("", true)
                          ]),
                          _: 3
                        })) : createCommentVNode("", true),
                        renderSlot(_ctx.$slots, "content", { close }, () => [
                          !!slots.header || (__props.title || !!slots.title) || (__props.description || !!slots.description) || (props.close || !!slots.close) ? (openBlock(), createBlock("div", {
                            key: 0,
                            "data-slot": "header",
                            class: ui.value.header({ class: props.ui?.header })
                          }, [
                            renderSlot(_ctx.$slots, "header", { close }, () => [
                              createVNode("div", {
                                "data-slot": "wrapper",
                                class: ui.value.wrapper({ class: props.ui?.wrapper })
                              }, [
                                __props.title || !!slots.title ? (openBlock(), createBlock(unref(DialogTitle), {
                                  key: 0,
                                  "data-slot": "title",
                                  class: ui.value.title({ class: props.ui?.title })
                                }, {
                                  default: withCtx(() => [
                                    renderSlot(_ctx.$slots, "title", {}, () => [
                                      createTextVNode(toDisplayString(__props.title), 1)
                                    ])
                                  ]),
                                  _: 3
                                }, 8, ["class"])) : createCommentVNode("", true),
                                __props.description || !!slots.description ? (openBlock(), createBlock(unref(DialogDescription), {
                                  key: 1,
                                  "data-slot": "description",
                                  class: ui.value.description({ class: props.ui?.description })
                                }, {
                                  default: withCtx(() => [
                                    renderSlot(_ctx.$slots, "description", {}, () => [
                                      createTextVNode(toDisplayString(__props.description), 1)
                                    ])
                                  ]),
                                  _: 3
                                }, 8, ["class"])) : createCommentVNode("", true)
                              ], 2),
                              renderSlot(_ctx.$slots, "actions"),
                              props.close || !!slots.close ? (openBlock(), createBlock(unref(DialogClose), {
                                key: 0,
                                "as-child": ""
                              }, {
                                default: withCtx(() => [
                                  renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => [
                                    props.close ? (openBlock(), createBlock(_sfc_main$8$1, mergeProps({
                                      key: 0,
                                      icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                                      color: "neutral",
                                      variant: "ghost",
                                      "aria-label": unref(t)("modal.close")
                                    }, typeof props.close === "object" ? props.close : {}, {
                                      "data-slot": "close",
                                      class: ui.value.close({ class: props.ui?.close })
                                    }), null, 16, ["icon", "aria-label", "class"])) : createCommentVNode("", true)
                                  ])
                                ]),
                                _: 2
                              }, 1024)) : createCommentVNode("", true)
                            ])
                          ], 2)) : createCommentVNode("", true),
                          !!slots.body ? (openBlock(), createBlock("div", {
                            key: 1,
                            "data-slot": "body",
                            class: ui.value.body({ class: props.ui?.body })
                          }, [
                            renderSlot(_ctx.$slots, "body", { close })
                          ], 2)) : createCommentVNode("", true),
                          !!slots.footer ? (openBlock(), createBlock("div", {
                            key: 2,
                            "data-slot": "footer",
                            class: ui.value.footer({ class: props.ui?.footer })
                          }, [
                            renderSlot(_ctx.$slots, "footer", { close })
                          ], 2)) : createCommentVNode("", true)
                        ])
                      ]),
                      _: 2
                    }, 1040, ["class", "onAfterEnter", "onAfterLeave"])
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
            if (!!slots.default) {
              _push2(ssrRenderComponent(unref(DialogTrigger), {
                "as-child": "",
                class: props.class
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "default", { open }, null, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "default", { open })
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(unref(DialogPortal), unref(portalProps), {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (__props.scrollable) {
                    _push3(ssrRenderComponent(unref(DialogOverlay), {
                      "data-slot": "overlay",
                      class: ui.value.overlay({ class: props.ui?.overlay })
                    }, {
                      default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(unref(ReuseContentTemplate), null, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(unref(ReuseContentTemplate))
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!--[-->`);
                    if (__props.overlay) {
                      _push3(ssrRenderComponent(unref(DialogOverlay), {
                        "data-slot": "overlay",
                        class: ui.value.overlay({ class: props.ui?.overlay })
                      }, null, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(ssrRenderComponent(unref(ReuseContentTemplate), null, null, _parent3, _scopeId2));
                    _push3(`<!--]-->`);
                  }
                } else {
                  return [
                    __props.scrollable ? (openBlock(), createBlock(unref(DialogOverlay), {
                      key: 0,
                      "data-slot": "overlay",
                      class: ui.value.overlay({ class: props.ui?.overlay })
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(ReuseContentTemplate))
                      ]),
                      _: 1
                    }, 8, ["class"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                      __props.overlay ? (openBlock(), createBlock(unref(DialogOverlay), {
                        key: 0,
                        "data-slot": "overlay",
                        class: ui.value.overlay({ class: props.ui?.overlay })
                      }, null, 8, ["class"])) : createCommentVNode("", true),
                      createVNode(unref(ReuseContentTemplate))
                    ], 64))
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(DefineContentTemplate), null, {
                default: withCtx(() => [
                  createVNode(unref(DialogContent), mergeProps({
                    "data-slot": "content",
                    class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                  }, contentProps.value, {
                    onAfterEnter: ($event) => emits("after:enter"),
                    onAfterLeave: ($event) => emits("after:leave")
                  }, toHandlers(contentEvents.value)), {
                    default: withCtx(() => [
                      !!slots.content && (__props.title || !!slots.title || (__props.description || !!slots.description)) ? (openBlock(), createBlock(unref(VisuallyHidden), { key: 0 }, {
                        default: withCtx(() => [
                          __props.title || !!slots.title ? (openBlock(), createBlock(unref(DialogTitle), { key: 0 }, {
                            default: withCtx(() => [
                              renderSlot(_ctx.$slots, "title", {}, () => [
                                createTextVNode(toDisplayString(__props.title), 1)
                              ])
                            ]),
                            _: 3
                          })) : createCommentVNode("", true),
                          __props.description || !!slots.description ? (openBlock(), createBlock(unref(DialogDescription), { key: 1 }, {
                            default: withCtx(() => [
                              renderSlot(_ctx.$slots, "description", {}, () => [
                                createTextVNode(toDisplayString(__props.description), 1)
                              ])
                            ]),
                            _: 3
                          })) : createCommentVNode("", true)
                        ]),
                        _: 3
                      })) : createCommentVNode("", true),
                      renderSlot(_ctx.$slots, "content", { close }, () => [
                        !!slots.header || (__props.title || !!slots.title) || (__props.description || !!slots.description) || (props.close || !!slots.close) ? (openBlock(), createBlock("div", {
                          key: 0,
                          "data-slot": "header",
                          class: ui.value.header({ class: props.ui?.header })
                        }, [
                          renderSlot(_ctx.$slots, "header", { close }, () => [
                            createVNode("div", {
                              "data-slot": "wrapper",
                              class: ui.value.wrapper({ class: props.ui?.wrapper })
                            }, [
                              __props.title || !!slots.title ? (openBlock(), createBlock(unref(DialogTitle), {
                                key: 0,
                                "data-slot": "title",
                                class: ui.value.title({ class: props.ui?.title })
                              }, {
                                default: withCtx(() => [
                                  renderSlot(_ctx.$slots, "title", {}, () => [
                                    createTextVNode(toDisplayString(__props.title), 1)
                                  ])
                                ]),
                                _: 3
                              }, 8, ["class"])) : createCommentVNode("", true),
                              __props.description || !!slots.description ? (openBlock(), createBlock(unref(DialogDescription), {
                                key: 1,
                                "data-slot": "description",
                                class: ui.value.description({ class: props.ui?.description })
                              }, {
                                default: withCtx(() => [
                                  renderSlot(_ctx.$slots, "description", {}, () => [
                                    createTextVNode(toDisplayString(__props.description), 1)
                                  ])
                                ]),
                                _: 3
                              }, 8, ["class"])) : createCommentVNode("", true)
                            ], 2),
                            renderSlot(_ctx.$slots, "actions"),
                            props.close || !!slots.close ? (openBlock(), createBlock(unref(DialogClose), {
                              key: 0,
                              "as-child": ""
                            }, {
                              default: withCtx(() => [
                                renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => [
                                  props.close ? (openBlock(), createBlock(_sfc_main$8$1, mergeProps({
                                    key: 0,
                                    icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                                    color: "neutral",
                                    variant: "ghost",
                                    "aria-label": unref(t)("modal.close")
                                  }, typeof props.close === "object" ? props.close : {}, {
                                    "data-slot": "close",
                                    class: ui.value.close({ class: props.ui?.close })
                                  }), null, 16, ["icon", "aria-label", "class"])) : createCommentVNode("", true)
                                ])
                              ]),
                              _: 2
                            }, 1024)) : createCommentVNode("", true)
                          ])
                        ], 2)) : createCommentVNode("", true),
                        !!slots.body ? (openBlock(), createBlock("div", {
                          key: 1,
                          "data-slot": "body",
                          class: ui.value.body({ class: props.ui?.body })
                        }, [
                          renderSlot(_ctx.$slots, "body", { close })
                        ], 2)) : createCommentVNode("", true),
                        !!slots.footer ? (openBlock(), createBlock("div", {
                          key: 2,
                          "data-slot": "footer",
                          class: ui.value.footer({ class: props.ui?.footer })
                        }, [
                          renderSlot(_ctx.$slots, "footer", { close })
                        ], 2)) : createCommentVNode("", true)
                      ])
                    ]),
                    _: 2
                  }, 1040, ["class", "onAfterEnter", "onAfterLeave"])
                ]),
                _: 2
              }, 1024),
              !!slots.default ? (openBlock(), createBlock(unref(DialogTrigger), {
                key: 0,
                "as-child": "",
                class: props.class
              }, {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default", { open })
                ]),
                _: 2
              }, 1032, ["class"])) : createCommentVNode("", true),
              createVNode(unref(DialogPortal), unref(portalProps), {
                default: withCtx(() => [
                  __props.scrollable ? (openBlock(), createBlock(unref(DialogOverlay), {
                    key: 0,
                    "data-slot": "overlay",
                    class: ui.value.overlay({ class: props.ui?.overlay })
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(ReuseContentTemplate))
                    ]),
                    _: 1
                  }, 8, ["class"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                    __props.overlay ? (openBlock(), createBlock(unref(DialogOverlay), {
                      key: 0,
                      "data-slot": "overlay",
                      class: ui.value.overlay({ class: props.ui?.overlay })
                    }, null, 8, ["class"])) : createCommentVNode("", true),
                    createVNode(unref(ReuseContentTemplate))
                  ], 64))
                ]),
                _: 1
              }, 16)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$l = _sfc_main$l.setup;
_sfc_main$l.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+ui@4.3.0_@babel+parser@7.28.5_@floating-ui+dom@1.7.4_@tiptap+extension-drag-handl_3a690419a02858a5ab0e0095ebe0c427/node_modules/@nuxt/ui/dist/runtime/components/Modal.vue");
  return _sfc_setup$l ? _sfc_setup$l(props, ctx) : void 0;
};
const theme$5 = {
  "slots": {
    "root": "rounded-lg overflow-hidden",
    "header": "p-4 sm:px-6",
    "body": "p-4 sm:p-6",
    "footer": "p-4 sm:px-6"
  },
  "variants": {
    "variant": {
      "solid": {
        "root": "bg-inverted text-inverted"
      },
      "outline": {
        "root": "bg-default ring ring-default divide-y divide-default"
      },
      "soft": {
        "root": "bg-elevated/50 divide-y divide-default"
      },
      "subtle": {
        "root": "bg-elevated/50 ring ring-default divide-y divide-default"
      }
    }
  },
  "defaultVariants": {
    "variant": "outline"
  }
};
const _sfc_main$k = {
  __name: "UCard",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    variant: { type: null, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme$5), ...appConfig.ui?.card || {} })({
      variant: props.variant
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-slot": "root",
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!!slots.header) {
              _push2(`<div data-slot="header" class="${ssrRenderClass(ui.value.header({ class: props.ui?.header }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "header", {}, null, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (!!slots.default) {
              _push2(`<div data-slot="body" class="${ssrRenderClass(ui.value.body({ class: props.ui?.body }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (!!slots.footer) {
              _push2(`<div data-slot="footer" class="${ssrRenderClass(ui.value.footer({ class: props.ui?.footer }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              !!slots.header ? (openBlock(), createBlock("div", {
                key: 0,
                "data-slot": "header",
                class: ui.value.header({ class: props.ui?.header })
              }, [
                renderSlot(_ctx.$slots, "header")
              ], 2)) : createCommentVNode("", true),
              !!slots.default ? (openBlock(), createBlock("div", {
                key: 1,
                "data-slot": "body",
                class: ui.value.body({ class: props.ui?.body })
              }, [
                renderSlot(_ctx.$slots, "default")
              ], 2)) : createCommentVNode("", true),
              !!slots.footer ? (openBlock(), createBlock("div", {
                key: 2,
                "data-slot": "footer",
                class: ui.value.footer({ class: props.ui?.footer })
              }, [
                renderSlot(_ctx.$slots, "footer")
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$k = _sfc_main$k.setup;
_sfc_main$k.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+ui@4.3.0_@babel+parser@7.28.5_@floating-ui+dom@1.7.4_@tiptap+extension-drag-handl_3a690419a02858a5ab0e0095ebe0c427/node_modules/@nuxt/ui/dist/runtime/components/Card.vue");
  return _sfc_setup$k ? _sfc_setup$k(props, ctx) : void 0;
};
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "DisclaimerModal",
  __ssrInlineRender: true,
  props: {
    onAccept: { type: Function },
    onDecline: { type: Function }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UModal = _sfc_main$l;
      const _component_UCard = _sfc_main$k;
      const _component_UButton = _sfc_main$8$1;
      _push(ssrRenderComponent(_component_UModal, mergeProps({
        open: true,
        ui: { width: "max-w-2xl" },
        dismissible: false
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) ;
          else {
            return [];
          }
        }),
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UCard, null, {
              header: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="p-6 border-b border-slate-700 bg-slate-900/50"${_scopeId2}><h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500"${_scopeId2}> Disclaimer &amp; Terms of Use </h2><p class="text-slate-400 text-sm mt-1"${_scopeId2}>Last Updated: December 21, 2025</p></div>`);
                } else {
                  return [
                    createVNode("div", { class: "p-6 border-b border-slate-700 bg-slate-900/50" }, [
                      createVNode("h2", { class: "text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500" }, " Disclaimer & Terms of Use "),
                      createVNode("p", { class: "text-slate-400 text-sm mt-1" }, "Last Updated: December 21, 2025")
                    ])
                  ];
                }
              }),
              footer: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="p-6 border-t border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row gap-3 justify-end items-center"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UButton, {
                    onClick: __props.onDecline,
                    color: "neutral",
                    variant: "outline",
                    class: "w-full sm:w-auto"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Decline `);
                      } else {
                        return [
                          createTextVNode(" Decline ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    onClick: __props.onAccept,
                    color: "success",
                    class: "w-full sm:w-auto"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Accept &amp; Continue `);
                      } else {
                        return [
                          createTextVNode(" Accept & Continue ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "p-6 border-t border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row gap-3 justify-end items-center" }, [
                      createVNode(_component_UButton, {
                        onClick: __props.onDecline,
                        color: "neutral",
                        variant: "outline",
                        class: "w-full sm:w-auto"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Decline ")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(_component_UButton, {
                        onClick: __props.onAccept,
                        color: "success",
                        class: "w-full sm:w-auto"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Accept & Continue ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ])
                  ];
                }
              }),
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="p-6 overflow-y-auto custom-scrollbar text-slate-300 space-y-4"${_scopeId2}><section${_scopeId2}><h3 class="text-lg font-semibold text-white mb-2"${_scopeId2}>Important Notice</h3><p${_scopeId2}><strong${_scopeId2}>NeuroEvolution: Stickman Fighters</strong> is provided as an experimental, demonstration application for exploratory and educational purposes. By using this application, you acknowledge and agree to the following terms: </p></section><section${_scopeId2}><h4 class="font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider"${_scopeId2}>No Warranties</h4><p class="text-sm"${_scopeId2}> This software is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without any warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, or accuracy. </p></section><section${_scopeId2}><h4 class="font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider"${_scopeId2}>No Liability</h4><p class="text-sm"${_scopeId2}> The developer(s) shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of productivity, or personal injury arising from the use or inability to use this application. </p></section><section${_scopeId2}><h4 class="font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider"${_scopeId2}>User Responsibility</h4><p class="text-sm"${_scopeId2}> You assume full responsibility for the use of this application, any consequences resulting from such use, and the security and backup of your data. </p></section><section${_scopeId2}><h4 class="font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider"${_scopeId2}>Experimental Nature</h4><p class="text-sm italic"${_scopeId2}> The application may contain bugs, errors, or incomplete features. The developer(s) make no guarantees regarding functionality, performance, data persistence, or continued availability. </p></section><section${_scopeId2}><h4 class="font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider"${_scopeId2}>Data Storage</h4><p class="text-sm"${_scopeId2}> All data (genomes, settings, etc.) is stored locally on your device using browser localStorage. We are not responsible for data loss due to browser settings or updates. </p></section><section${_scopeId2}><p class="text-sm font-medium text-slate-400 mt-6 border-t border-slate-700/50 pt-4"${_scopeId2}> By clicking &quot;Accept&quot;, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree, you must click &quot;Decline&quot;. </p></section></div>`);
                } else {
                  return [
                    createVNode("div", { class: "p-6 overflow-y-auto custom-scrollbar text-slate-300 space-y-4" }, [
                      createVNode("section", null, [
                        createVNode("h3", { class: "text-lg font-semibold text-white mb-2" }, "Important Notice"),
                        createVNode("p", null, [
                          createVNode("strong", null, "NeuroEvolution: Stickman Fighters"),
                          createTextVNode(" is provided as an experimental, demonstration application for exploratory and educational purposes. By using this application, you acknowledge and agree to the following terms: ")
                        ])
                      ]),
                      createVNode("section", null, [
                        createVNode("h4", { class: "font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider" }, "No Warranties"),
                        createVNode("p", { class: "text-sm" }, ' This software is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, or accuracy. ')
                      ]),
                      createVNode("section", null, [
                        createVNode("h4", { class: "font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider" }, "No Liability"),
                        createVNode("p", { class: "text-sm" }, " The developer(s) shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of productivity, or personal injury arising from the use or inability to use this application. ")
                      ]),
                      createVNode("section", null, [
                        createVNode("h4", { class: "font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider" }, "User Responsibility"),
                        createVNode("p", { class: "text-sm" }, " You assume full responsibility for the use of this application, any consequences resulting from such use, and the security and backup of your data. ")
                      ]),
                      createVNode("section", null, [
                        createVNode("h4", { class: "font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider" }, "Experimental Nature"),
                        createVNode("p", { class: "text-sm italic" }, " The application may contain bugs, errors, or incomplete features. The developer(s) make no guarantees regarding functionality, performance, data persistence, or continued availability. ")
                      ]),
                      createVNode("section", null, [
                        createVNode("h4", { class: "font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider" }, "Data Storage"),
                        createVNode("p", { class: "text-sm" }, " All data (genomes, settings, etc.) is stored locally on your device using browser localStorage. We are not responsible for data loss due to browser settings or updates. ")
                      ]),
                      createVNode("section", null, [
                        createVNode("p", { class: "text-sm font-medium text-slate-400 mt-6 border-t border-slate-700/50 pt-4" }, ' By clicking "Accept", you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree, you must click "Decline". ')
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UCard, null, {
                header: withCtx(() => [
                  createVNode("div", { class: "p-6 border-b border-slate-700 bg-slate-900/50" }, [
                    createVNode("h2", { class: "text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500" }, " Disclaimer & Terms of Use "),
                    createVNode("p", { class: "text-slate-400 text-sm mt-1" }, "Last Updated: December 21, 2025")
                  ])
                ]),
                footer: withCtx(() => [
                  createVNode("div", { class: "p-6 border-t border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row gap-3 justify-end items-center" }, [
                    createVNode(_component_UButton, {
                      onClick: __props.onDecline,
                      color: "neutral",
                      variant: "outline",
                      class: "w-full sm:w-auto"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Decline ")
                      ]),
                      _: 1
                    }, 8, ["onClick"]),
                    createVNode(_component_UButton, {
                      onClick: __props.onAccept,
                      color: "success",
                      class: "w-full sm:w-auto"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Accept & Continue ")
                      ]),
                      _: 1
                    }, 8, ["onClick"])
                  ])
                ]),
                default: withCtx(() => [
                  createVNode("div", { class: "p-6 overflow-y-auto custom-scrollbar text-slate-300 space-y-4" }, [
                    createVNode("section", null, [
                      createVNode("h3", { class: "text-lg font-semibold text-white mb-2" }, "Important Notice"),
                      createVNode("p", null, [
                        createVNode("strong", null, "NeuroEvolution: Stickman Fighters"),
                        createTextVNode(" is provided as an experimental, demonstration application for exploratory and educational purposes. By using this application, you acknowledge and agree to the following terms: ")
                      ])
                    ]),
                    createVNode("section", null, [
                      createVNode("h4", { class: "font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider" }, "No Warranties"),
                      createVNode("p", { class: "text-sm" }, ' This software is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, or accuracy. ')
                    ]),
                    createVNode("section", null, [
                      createVNode("h4", { class: "font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider" }, "No Liability"),
                      createVNode("p", { class: "text-sm" }, " The developer(s) shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of productivity, or personal injury arising from the use or inability to use this application. ")
                    ]),
                    createVNode("section", null, [
                      createVNode("h4", { class: "font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider" }, "User Responsibility"),
                      createVNode("p", { class: "text-sm" }, " You assume full responsibility for the use of this application, any consequences resulting from such use, and the security and backup of your data. ")
                    ]),
                    createVNode("section", null, [
                      createVNode("h4", { class: "font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider" }, "Experimental Nature"),
                      createVNode("p", { class: "text-sm italic" }, " The application may contain bugs, errors, or incomplete features. The developer(s) make no guarantees regarding functionality, performance, data persistence, or continued availability. ")
                    ]),
                    createVNode("section", null, [
                      createVNode("h4", { class: "font-semibold text-slate-100 mb-1 font-mono uppercase text-xs tracking-wider" }, "Data Storage"),
                      createVNode("p", { class: "text-sm" }, " All data (genomes, settings, etc.) is stored locally on your device using browser localStorage. We are not responsible for data loss due to browser settings or updates. ")
                    ]),
                    createVNode("section", null, [
                      createVNode("p", { class: "text-sm font-medium text-slate-400 mt-6 border-t border-slate-700/50 pt-4" }, ' By clicking "Accept", you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree, you must click "Decline". ')
                    ])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DisclaimerModal.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const __nuxt_component_1$2 = Object.assign(_sfc_main$j, { __name: "DisclaimerModal" });
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "GameHUD",
  __ssrInlineRender: true,
  props: {
    activeMatch: {},
    gameState: {},
    settings: {},
    currentMatchIndex: {}
  },
  setup(__props) {
    const props = __props;
    function getFighterInfo(f, gameMode, generation) {
      if (f.isCustom) {
        if (f.color === "#a855f7") return { label: "SCRIPT A", color: "text-purple-400", bar: "bg-purple-400" };
        if (f.color === "#14b8a6") return { label: "SCRIPT B", color: "text-teal-400", bar: "bg-teal-400" };
        return { label: "CUSTOM", color: "text-purple-400", bar: "bg-purple-400" };
      }
      if (!f.isAi) {
        return { label: "HUMAN", color: "text-green-500", bar: "bg-green-500" };
      }
      if (gameMode === "TRAINING") {
        return { label: `GEN ${generation}`, color: "text-blue-400", bar: "bg-blue-500" };
      }
      return { label: "AI", color: "text-blue-500", bar: "bg-blue-500" };
    }
    const leftInfo = computed(() => {
      if (!props.activeMatch) return { label: "", color: "", bar: "" };
      const p1 = props.activeMatch.p1;
      const p2 = props.activeMatch.p2;
      let info = getFighterInfo(p1, props.settings.gameMode, props.gameState.generation);
      if (props.settings.gameMode === "TRAINING" && p1.isAi && p2.isAi && !p1.isCustom && !p2.isCustom) {
        info = { label: "P1", color: "text-red-500", bar: "bg-red-500" };
      }
      return info;
    });
    const rightInfo = computed(() => {
      if (!props.activeMatch) return { label: "", color: "", bar: "" };
      const p1 = props.activeMatch.p1;
      const p2 = props.activeMatch.p2;
      let info = getFighterInfo(p2, props.settings.gameMode, props.gameState.generation);
      if (props.settings.gameMode === "TRAINING" && p1.isAi && p2.isAi && !p1.isCustom && !p2.isCustom) {
        info = { label: "P2", color: "text-blue-500", bar: "bg-blue-500" };
      }
      return info;
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.activeMatch) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "absolute top-4 left-4 right-4 flex justify-between text-xl font-bold font-mono z-10 drop-shadow-md pointer-events-none" }, _attrs))}><div class="flex flex-col items-start"><span class="${ssrRenderClass([leftInfo.value.color, "font-bold text-xs tracking-wider animate-pulse"])}">${ssrInterpolate(leftInfo.value.label)}</span><div class="w-32 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden"><div class="${ssrRenderClass(["h-full", leftInfo.value.bar, "transition-all duration-75"])}" style="${ssrRenderStyle({ width: `${__props.gameState.player1Health}%` })}"></div></div><div class="w-32 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1"><div class="h-full bg-amber-400 transition-all duration-75" style="${ssrRenderStyle({ width: `${__props.gameState.player1Energy}%` })}"></div></div></div><div class="flex flex-col items-center pt-2">`);
        if (__props.settings.gameMode === "TRAINING") {
          _push(`<!--[--><span class="text-slate-500 font-bold text-[10px] tracking-widest uppercase">ROUND ${ssrInterpolate(__props.currentMatchIndex + 1)}</span><span class="text-slate-300 font-mono text-sm">${ssrInterpolate(__props.gameState.timeRemaining.toFixed(0))}</span><span class="text-teal-400 font-bold text-[9px] tracking-wider uppercase mt-1">${ssrInterpolate(__props.gameState.matchesUntilEvolution)} ${ssrInterpolate(__props.gameState.matchesUntilEvolution === 1 ? "MATCH" : "MATCHES")} TO EVOLVE </span><!--]-->`);
        } else {
          _push(`<!--[--><span class="text-white font-bold opacity-60 tracking-widest text-xs">VS</span><span class="text-yellow-400 font-mono text-sm">${ssrInterpolate(__props.gameState.timeRemaining.toFixed(0))}</span><!--]-->`);
        }
        _push(`</div><div class="flex flex-col items-end"><span class="${ssrRenderClass([rightInfo.value.color, "font-bold text-xs tracking-wider animate-pulse"])}">${ssrInterpolate(rightInfo.value.label)}</span><div class="w-32 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden"><div class="${ssrRenderClass(["h-full", rightInfo.value.bar, "transition-all duration-75"])}" style="${ssrRenderStyle({ width: `${__props.gameState.player2Health}%` })}"></div></div><div class="w-32 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1"><div class="h-full bg-amber-400 transition-all duration-75" style="${ssrRenderStyle({ width: `${__props.gameState.player2Energy}%` })}"></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/GameHUD.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const __nuxt_component_0$1 = Object.assign(_sfc_main$i, { __name: "GameHUD" });
var FighterAction = /* @__PURE__ */ ((FighterAction2) => {
  FighterAction2[FighterAction2["IDLE"] = 0] = "IDLE";
  FighterAction2[FighterAction2["MOVE_LEFT"] = 1] = "MOVE_LEFT";
  FighterAction2[FighterAction2["MOVE_RIGHT"] = 2] = "MOVE_RIGHT";
  FighterAction2[FighterAction2["JUMP"] = 3] = "JUMP";
  FighterAction2[FighterAction2["CROUCH"] = 4] = "CROUCH";
  FighterAction2[FighterAction2["PUNCH"] = 5] = "PUNCH";
  FighterAction2[FighterAction2["KICK"] = 6] = "KICK";
  FighterAction2[FighterAction2["BLOCK"] = 7] = "BLOCK";
  return FighterAction2;
})(FighterAction || {});
const NN_ARCH = {
  INPUT_NODES: 9,
  HIDDEN_NODES: 13,
  OUTPUT_NODES: 8
};
const WORLD = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 450,
  GRAVITY: 0.8,
  FRICTION: 0.85,
  GROUND_Y: 415
};
const ENERGY = {
  MAX: 100,
  REGEN_IDLE: 0.5,
  REGEN_ACTIVE: 0.2,
  COST_MOVE: 0.1,
  COST_JUMP: 10,
  COST_CROUCH: 0.5,
  COST_BLOCK: 0.5,
  COST_PUNCH: 10,
  COST_KICK: 50,
  PENALTY_HIT: 1
};
const INPUT_NODES = NN_ARCH.INPUT_NODES;
const HIDDEN_NODES = NN_ARCH.HIDDEN_NODES;
const OUTPUT_NODES = NN_ARCH.OUTPUT_NODES;
const createRandomNetwork = () => {
  const inputWeights = Array(INPUT_NODES).fill(0).map(
    () => Array(HIDDEN_NODES).fill(0).map(() => Math.random() * 2 - 1)
  );
  const outputWeights = Array(HIDDEN_NODES).fill(0).map(
    () => Array(OUTPUT_NODES).fill(0).map(() => Math.random() * 2 - 1)
  );
  const biases = Array(HIDDEN_NODES + OUTPUT_NODES).fill(0).map(() => Math.random() * 2 - 1);
  return { inputWeights, outputWeights, biases };
};
const sigmoid = (t) => 1 / (1 + Math.exp(-t));
const relu = (t) => Math.max(0, t);
const predict = (network, inputs) => {
  const hiddenOutputs = [];
  for (let h = 0; h < HIDDEN_NODES; h++) {
    let sum = 0;
    for (let i = 0; i < INPUT_NODES; i++) {
      sum += inputs[i] * network.inputWeights[i][h];
    }
    sum += network.biases[h];
    hiddenOutputs.push(relu(sum));
  }
  const finalOutputs = [];
  for (let o = 0; o < OUTPUT_NODES; o++) {
    let sum = 0;
    for (let h = 0; h < HIDDEN_NODES; h++) {
      sum += hiddenOutputs[h] * network.outputWeights[h][o];
    }
    sum += network.biases[HIDDEN_NODES + o];
    finalOutputs.push(sigmoid(sum));
  }
  return finalOutputs;
};
const mutateNetwork = (network, rate) => {
  const mutateValue = (val) => {
    if (Math.random() < rate) {
      if (Math.random() < 0.1) {
        return val + (Math.random() * 4 - 2);
      }
      const magnitude = 0.5 + rate * 0.5;
      return val + (Math.random() * 2 * magnitude - magnitude);
    }
    return val;
  };
  const newInputWeights = network.inputWeights.map((row) => row.map(mutateValue));
  const newOutputWeights = network.outputWeights.map((row) => row.map(mutateValue));
  const newBiases = network.biases.map(mutateValue);
  return {
    inputWeights: newInputWeights,
    outputWeights: newOutputWeights,
    biases: newBiases
  };
};
const crossoverNetworks = (a, b) => {
  const mix = (w1, w2) => Math.random() > 0.5 ? w1 : w2;
  const newInputWeights = a.inputWeights.map(
    (row, i) => row.map((val, j) => mix(val, b.inputWeights[i][j]))
  );
  const newOutputWeights = a.outputWeights.map(
    (row, i) => row.map((val, j) => mix(val, b.outputWeights[i][j]))
  );
  const newBiases = a.biases.map((val, i) => mix(val, b.biases[i]));
  return {
    inputWeights: newInputWeights,
    outputWeights: newOutputWeights,
    biases: newBiases
  };
};
const exportGenome = (genome, generation = 1) => {
  return JSON.stringify({
    id: genome.id,
    network: genome.network,
    fitness: genome.fitness,
    matchesWon: genome.matchesWon,
    generation,
    metadata: {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.1",
      architecture: {
        inputNodes: INPUT_NODES,
        hiddenNodes: HIDDEN_NODES,
        outputNodes: OUTPUT_NODES
      }
    }
  }, null, 2);
};
const importGenome = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.network || !data.network.inputWeights || !data.network.outputWeights || !data.network.biases) {
      return { success: false, error: "Invalid file format: missing network data" };
    }
    const fileHidden = data.network.outputWeights.length;
    const fileBiases = data.network.biases.length;
    if (data.network.inputWeights.length !== INPUT_NODES) {
      return {
        success: false,
        error: `Input dimension mismatch: file has ${data.network.inputWeights.length}, app expects ${INPUT_NODES}`
      };
    }
    if (fileHidden !== HIDDEN_NODES) {
      return {
        success: false,
        error: `Architecture mismatch: file has ${fileHidden} hidden neurons, app expects ${HIDDEN_NODES}. This file was exported from an older version.`
      };
    }
    if (fileBiases !== HIDDEN_NODES + OUTPUT_NODES) {
      return {
        success: false,
        error: `Bias count mismatch: file has ${fileBiases}, app expects ${HIDDEN_NODES + OUTPUT_NODES}`
      };
    }
    return {
      success: true,
      genome: {
        id: data.id || `imported-${Date.now()}`,
        network: data.network,
        fitness: data.fitness || 0,
        matchesWon: data.matchesWon || 0
      },
      generation: data.generation || 1
    };
  } catch (error) {
    console.error("Failed to import genome:", error);
    return { success: false, error: "Failed to parse file. Is this a valid JSON file?" };
  }
};
function WorkerWrapper$1(options) {
  return new Worker(
    "" + __buildAssetsURL("CustomScriptWorker-rpfC-nGR.js"),
    {
      type: "module",
      name: options?.name
    }
  );
}
function compileScript(userCode) {
  try {
    const wrappedCode = `
      ${userCode}
      return typeof decide === 'function' ? decide : null;
    `;
    const factoryFunction = new Function(wrappedCode);
    const userDecideFunction = factoryFunction();
    if (!userDecideFunction) {
      return {
        compiledDecideFunction: null,
        error: 'No "decide" function found. Make sure you define: function decide(self, opponent) { ... }'
      };
    }
    const safeDecideFunction = (self, opponent) => {
      try {
        const userResult = userDecideFunction(self, opponent);
        return {
          left: Boolean(userResult?.left),
          right: Boolean(userResult?.right),
          up: Boolean(userResult?.up),
          down: Boolean(userResult?.down),
          action1: Boolean(userResult?.action1),
          action2: Boolean(userResult?.action2),
          action3: Boolean(userResult?.action3)
        };
      } catch (runtimeError) {
        console.warn("Custom script runtime error:", runtimeError.message);
        return {
          left: false,
          right: false,
          up: false,
          down: false,
          action1: false,
          action2: false,
          action3: false
        };
      }
    };
    return { compiledDecideFunction: safeDecideFunction, error: null };
  } catch (syntaxError) {
    return {
      compiledDecideFunction: null,
      error: `Syntax Error: ${syntaxError.message}`
    };
  }
}
const DEFAULT_FIGHTER_SCRIPT = `/**
 * ============================================================
 * CUSTOM FIGHTER AI - Write Your Own Logic!
 * ============================================================
 * 
 * This function runs every frame (60 times per second).
 * Look at what's happening in the game, then decide what to do!
 * 
 * ============================================================
 * INPUTS - Information you receive:
 * ============================================================
 * 
 *   self     = Your fighter (the one you're controlling)
 *   opponent = The enemy fighter
 * 
 * Both fighters have these properties:
 * 
 *   PROPERTY     MEANING                              RANGE
 *   ─────────────────────────────────────────────────────────
 *   x            Horizontal position                  0 to 800
 *   y            Vertical position (380 = ground)     0 to 380
 *   vx           Horizontal speed                     varies
 *   vy           Vertical speed                       varies
 *   health       Hit points remaining                 0 to 100
 *   energy       Power for attacks                    0 to 100
 *   cooldown     Frames until you can act again       0 = ready!
 *   direction    Which way you're facing              -1 or 1
 * 
 * ============================================================
 * OUTPUTS - Actions you can take:
 * ============================================================
 * 
 *   ACTION       WHAT IT DOES                         ENERGY COST
 *   ─────────────────────────────────────────────────────────────
 *   left         Move left                            free
 *   right        Move right                           free
 *   up           Jump                                 25 energy
 *   down         Crouch (blocks kicks better)         free
 *   action1      Punch (quick, 5 damage)              30 energy
 *   action2      Kick (slow, 10 damage)               60 energy
 *   action3      Block (reduces damage taken)         drains energy
 * 
 * ============================================================
 */

function decide(self, opponent) {
  
  // ============================================================
  // STEP 1: Analyze the situation
  // ============================================================
  
  // How far away is the opponent? (in pixels)
  const distanceToOpponent = Math.abs(self.x - opponent.x);
  
  // Which direction is the opponent?
  const opponentIsToMyRight = opponent.x > self.x;
  const opponentIsToMyLeft = opponent.x < self.x;
  
  // Am I on the ground? (can only jump from ground)
  const GROUND_LEVEL = 270;
  const iAmOnTheGround = self.y >= GROUND_LEVEL;
  
  // Am I ready to act? (cooldown must be 0)
  const iAmReadyToAct = self.cooldown === 0;
  
  // Is opponent in the middle of an attack animation?
  // (Their cooldown will be between these values during attack)
  const ATTACK_ANIMATION_START_FRAME = 15;
  const ATTACK_ANIMATION_END_FRAME = 35;
  const opponentIsCurrentlyAttacking = 
      opponent.cooldown > ATTACK_ANIMATION_START_FRAME && 
      opponent.cooldown < ATTACK_ANIMATION_END_FRAME;
  
  
  // ============================================================
  // STEP 2: Initialize all actions to "don't do this"
  // ============================================================
  
  // Movement actions
  let moveLeft = false;
  let moveRight = false;
  let jump = false;
  let crouch = false;
  
  // Attack/defense actions  
  let doPunch = false;
  let doKick = false;
  let doBlock = false;
  
  
  // ============================================================
  // STEP 3: Decide on MOVEMENT
  // ============================================================
  
  // Distance thresholds (in pixels)
  const TOO_FAR_AWAY = 200;      // Need to get closer
  const TOO_CLOSE = 50;          // Might want to back up
  const MINIMUM_ENERGY_FOR_CHASE = 30;
  
  // If opponent is far away, move toward them
  if (distanceToOpponent > TOO_FAR_AWAY && self.energy > MINIMUM_ENERGY_FOR_CHASE) {
    if (opponentIsToMyRight) {
      moveRight = true;
    } else {
      moveLeft = true;
    }
  }
  
  // If opponent is very close, sometimes back away (30% chance)
  const shouldRetreat = Math.random() < 0.3;  // Random chance each frame
  if (distanceToOpponent < TOO_CLOSE && shouldRetreat) {
    if (opponentIsToMyRight) {
      moveLeft = true;   // Back away to the left
    } else {
      moveRight = true;  // Back away to the right
    }
  }
  
  
  // ============================================================
  // STEP 4: Decide on DEFENSE
  // ============================================================
  
  const BLOCK_RANGE = 130;           // How close before we block
  const MINIMUM_ENERGY_TO_BLOCK = 20;
  
  // Block if: opponent is attacking AND they're close AND we have energy
  const shouldBlock = 
      opponentIsCurrentlyAttacking && 
      distanceToOpponent < BLOCK_RANGE && 
      self.energy > MINIMUM_ENERGY_TO_BLOCK;
  
  if (shouldBlock) {
    doBlock = true;
    // Stop moving while blocking (focus on defense)
    moveLeft = false;
    moveRight = false;
  }
  
  
  // ============================================================
  // STEP 5: Decide on OFFENSE
  // ============================================================
  
  const PUNCH_RANGE = 80;            // Close range for punches
  const KICK_RANGE = 120;            // Medium range for kicks
  const MINIMUM_ENERGY_FOR_PUNCH = 30;
  const MINIMUM_ENERGY_FOR_KICK = 60;
  
  // Only attack if: not blocking AND ready to act AND have energy
  const canAttack = !doBlock && iAmReadyToAct && self.energy > MINIMUM_ENERGY_FOR_PUNCH;
  
  if (canAttack) {
    // Close range: prefer punch (70% chance), sometimes kick
    if (distanceToOpponent < PUNCH_RANGE) {
      const preferPunch = Math.random() < 0.7;
      if (preferPunch) {
        doPunch = true;
      } else if (self.energy > MINIMUM_ENERGY_FOR_KICK) {
        doKick = true;
      }
    }
    // Medium range: use kick (longer reach)
    else if (distanceToOpponent < KICK_RANGE && self.energy > MINIMUM_ENERGY_FOR_KICK) {
      doKick = true;
    }
  }
  
  
  // ============================================================
  // STEP 6: Decide on JUMPING
  // ============================================================
  
  const MINIMUM_ENERGY_TO_JUMP = 25;
  const JUMP_CHANCE = 0.05;  // 5% chance each frame = occasional jumps
  
  // Sometimes jump to dodge attacks or mix up movement
  const shouldJump = 
      iAmOnTheGround && 
      self.energy > MINIMUM_ENERGY_TO_JUMP && 
      Math.random() < JUMP_CHANCE;
  
  if (shouldJump) {
    jump = true;
  }
  
  
  // ============================================================
  // STEP 7: Return the final decision
  // ============================================================
  
  // This object tells the game which "buttons" to press this frame
  return {
    left: moveLeft,       // Press left arrow?
    right: moveRight,     // Press right arrow?
    up: jump,             // Press jump?
    down: crouch,         // Press crouch?
    action1: doPunch,     // Press punch button?
    action2: doKick,      // Press kick button?
    action3: doBlock      // Press block button?
  };
}
`;
const LOCALSTORAGE_SCRIPT_KEY_PREFIX = "neuroevolution_fighter_script_";
function saveScript(scriptCode, slotId = "slot1") {
  try {
    localStorage.setItem(`${LOCALSTORAGE_SCRIPT_KEY_PREFIX}${slotId}`, scriptCode);
  } catch (storageError) {
    console.warn("Failed to save script to localStorage:", storageError);
  }
}
function loadScript(slotId = "slot1") {
  try {
    const saved = localStorage.getItem(`${LOCALSTORAGE_SCRIPT_KEY_PREFIX}${slotId}`);
    return saved || DEFAULT_FIGHTER_SCRIPT;
  } catch (storageError) {
    console.warn("Failed to load script from localStorage:", storageError);
    return DEFAULT_FIGHTER_SCRIPT;
  }
}
function exportScript(scriptCode) {
  const exportData = {
    version: 1,
    type: "neuroevolution-fighter-script",
    code: scriptCode,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const jsonString = JSON.stringify(exportData, null, 2);
  const fileBlob = new Blob([jsonString], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(fileBlob);
  const downloadLink = (void 0).createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = "custom-fighter-script.json";
  (void 0).body.appendChild(downloadLink);
  downloadLink.click();
  (void 0).body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadUrl);
}
function importScript(jsonString) {
  try {
    const parsedData = JSON.parse(jsonString);
    const isValidType = parsedData.type === "neuroevolution-fighter-script";
    const hasCodeString = typeof parsedData.code === "string";
    if (!isValidType || !hasCodeString) {
      return null;
    }
    return parsedData.code;
  } catch (parseError) {
    console.warn("Failed to parse imported script:", parseError);
    return null;
  }
}
function getDefaultTemplate() {
  return DEFAULT_FIGHTER_SCRIPT;
}
class ScriptWorkerManager {
  constructor() {
    this.workerInstance = null;
    this.cachedAction = {
      left: false,
      right: false,
      up: false,
      down: false,
      action1: false,
      action2: false,
      action3: false
    };
    this.scriptIsCompiled = false;
    this.lastErrorMessage = null;
  }
  async compile(userCode) {
    this.terminate();
    return new Promise((resolvePromise) => {
      try {
        this.workerInstance = new WorkerWrapper$1();
        if (!this.workerInstance) throw new Error("Worker creation failed");
        const worker = this.workerInstance;
        worker.onmessage = (messageEvent) => {
          const { type, success, action, error } = messageEvent.data;
          if (type === "compiled") {
            this.scriptIsCompiled = success;
            this.lastErrorMessage = error || null;
            resolvePromise({ success, error: error || null });
          }
          if (type === "result") {
            if (success && action) {
              this.cachedAction = action;
            }
            if (error) {
              this.lastErrorMessage = error;
            }
          }
        };
        worker.onerror = (errorEvent) => {
          this.lastErrorMessage = errorEvent.message;
          this.scriptIsCompiled = false;
          resolvePromise({ success: false, error: errorEvent.message });
        };
        worker.postMessage({ type: "compile", code: userCode });
      } catch (setupError) {
        this.lastErrorMessage = setupError.message;
        resolvePromise({ success: false, error: setupError.message });
      }
    });
  }
  requestAction(selfFighter, opponentFighter) {
    if (this.workerInstance && this.scriptIsCompiled) {
      this.workerInstance.postMessage({
        type: "execute",
        self: selfFighter,
        opponent: opponentFighter
      });
    }
  }
  getAction() {
    return this.cachedAction;
  }
  isReady() {
    return this.scriptIsCompiled && this.workerInstance !== null;
  }
  getError() {
    return this.lastErrorMessage;
  }
  terminate() {
    if (this.workerInstance) {
      this.workerInstance.terminate();
      this.workerInstance = null;
    }
    this.scriptIsCompiled = false;
    this.cachedAction = {
      left: false,
      right: false,
      up: false,
      down: false,
      action1: false,
      action2: false,
      action3: false
    };
  }
}
class NeuralNetwork {
  constructor(id) {
    this.id = id;
  }
}
class FeedForwardNetwork extends NeuralNetwork {
  constructor(id, weights) {
    super(id);
    if (weights) {
      this.inputWeights = weights.input;
      this.outputWeights = weights.output;
      this.biases = weights.biases;
    } else {
      this.inputWeights = this.createRandomMatrix(NN_ARCH.INPUT_NODES, NN_ARCH.HIDDEN_NODES);
      this.outputWeights = this.createRandomMatrix(NN_ARCH.HIDDEN_NODES, NN_ARCH.OUTPUT_NODES);
      this.biases = this.createRandomArray(NN_ARCH.HIDDEN_NODES + NN_ARCH.OUTPUT_NODES);
    }
    this.hiddenBuffer = new Array(NN_ARCH.HIDDEN_NODES).fill(0);
    this.outputBuffer = new Array(NN_ARCH.OUTPUT_NODES).fill(0);
  }
  /**
   * Helper to create random weight matrix
   */
  createRandomMatrix(rows, cols) {
    return Array(rows).fill(0).map(
      () => Array(cols).fill(0).map(() => Math.random() * 2 - 1)
    );
  }
  createRandomArray(size) {
    return Array(size).fill(0).map(() => Math.random() * 2 - 1);
  }
  /**
   * Activation Functions
   */
  relu(x) {
    return Math.max(0, x);
  }
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
  /**
   * Optimized Predict method (No dynamic allocation)
   */
  predict(inputs) {
    if (inputs.length !== NN_ARCH.INPUT_NODES) {
      throw new Error(`Input size mismatch. Expected ${NN_ARCH.INPUT_NODES}, got ${inputs.length}`);
    }
    for (let h = 0; h < NN_ARCH.HIDDEN_NODES; h++) {
      let sum = 0;
      for (let i = 0; i < NN_ARCH.INPUT_NODES; i++) {
        const weight = this.inputWeights[i]?.[h];
        if (weight !== void 0) {
          sum += inputs[i] * weight;
        }
      }
      const bias = this.biases[h];
      if (bias !== void 0) {
        sum += bias;
      }
      this.hiddenBuffer[h] = this.relu(sum);
    }
    for (let o = 0; o < NN_ARCH.OUTPUT_NODES; o++) {
      let sum = 0;
      for (let h = 0; h < NN_ARCH.HIDDEN_NODES; h++) {
        const hiddenVal = this.hiddenBuffer[h];
        const weight = this.outputWeights[h]?.[o];
        if (hiddenVal !== void 0 && weight !== void 0) {
          sum += hiddenVal * weight;
        }
      }
      const bias = this.biases[NN_ARCH.HIDDEN_NODES + o];
      if (bias !== void 0) {
        sum += bias;
      }
      this.outputBuffer[o] = this.sigmoid(sum);
    }
    return this.outputBuffer.slice();
  }
  /**
   * Get intermediate activations for visualization.
   */
  getActivations(inputs) {
    this.predict(inputs);
    return {
      hidden: this.hiddenBuffer.slice(),
      output: this.outputBuffer.slice()
    };
  }
  mutate(rate) {
    const mutateValue = (val) => {
      if (Math.random() < rate) {
        if (Math.random() < 0.1) {
          return val + (Math.random() * 4 - 2);
        }
        const magnitude = 0.5 + rate * 0.5;
        return val + (Math.random() * 2 * magnitude - magnitude);
      }
      return val;
    };
    for (let i = 0; i < this.inputWeights.length; i++) {
      const row = this.inputWeights[i];
      if (row) {
        for (let j = 0; j < row.length; j++) {
          const val = row[j];
          if (val !== void 0) {
            row[j] = mutateValue(val);
          }
        }
      }
    }
    for (let i = 0; i < this.outputWeights.length; i++) {
      const row = this.outputWeights[i];
      if (row) {
        for (let j = 0; j < row.length; j++) {
          const val = row[j];
          if (val !== void 0) {
            row[j] = mutateValue(val);
          }
        }
      }
    }
    for (let i = 0; i < this.biases.length; i++) {
      const bias = this.biases[i];
      if (bias !== void 0) {
        this.biases[i] = mutateValue(bias);
      }
    }
  }
  clone() {
    const inputCopy = this.inputWeights.map((row) => [...row]);
    const outputCopy = this.outputWeights.map((row) => [...row]);
    const biasesCopy = [...this.biases];
    return new FeedForwardNetwork(`clone-${Date.now()}-${Math.random()}`, {
      input: inputCopy,
      output: outputCopy,
      biases: biasesCopy
    });
  }
  toJSON() {
    return {
      type: "FeedForwardNetwork",
      inputWeights: this.inputWeights,
      outputWeights: this.outputWeights,
      biases: this.biases
    };
  }
  fromJSON(data) {
    this.inputWeights = data.inputWeights;
    this.outputWeights = data.outputWeights;
    this.biases = data.biases;
  }
}
function applyFitnessShaping(fighter, opponent, genome) {
  if (opponent.health <= 0) return;
  const dist = Math.abs(fighter.x - opponent.x);
  if (dist < 400) genome.fitness += 5e-3;
  if (dist < 200) genome.fitness += 0.02;
  if (dist < 80) genome.fitness += 0.05;
  const dx = opponent.x - fighter.x;
  const correctFacing = dx > 0 && fighter.direction === 1 || dx < 0 && fighter.direction === -1;
  if (correctFacing) genome.fitness += 0.02;
  if (dist < 100 && (fighter.state === FighterAction.PUNCH || fighter.state === FighterAction.KICK)) {
    genome.fitness += 0.1;
  }
  genome.fitness -= 5e-3;
  const edgeThreshold = 60;
  if (fighter.x < edgeThreshold || fighter.x > CANVAS_WIDTH - fighter.width - edgeThreshold) {
    genome.fitness -= 0.04;
  }
  const centerX = CANVAS_WIDTH / 2;
  const distFromCenter = Math.abs(fighter.x + fighter.width / 2 - centerX);
  if (distFromCenter < 150) {
    genome.fitness += 0.015;
  }
  if (Math.abs(fighter.vx) > 0.5) {
    genome.fitness += 8e-3;
  }
}
const GRAVITY = WORLD.GRAVITY;
const FRICTION = WORLD.FRICTION;
const GROUND_Y = WORLD.GROUND_Y;
const CANVAS_WIDTH = WORLD.CANVAS_WIDTH;
const CANVAS_HEIGHT = WORLD.CANVAS_HEIGHT;
class Fighter {
  /**
   * Creates a new Fighter
   * 
   * @param x - Starting X position
   * @param color - Display color for rendering
   * @param isAi - Whether this fighter is AI-controlled
   * @param genome - Optional AI genome (required if isAi is true)
   */
  constructor(x, color, isAi, genome) {
    this.vx = 0;
    this.vy = 0;
    this.lastInputs = [];
    this.width = 55;
    this.height = 110;
    this.scriptWorker = null;
    this.health = 100;
    this.energy = ENERGY.MAX;
    this.state = FighterAction.IDLE;
    this.direction = 1;
    this.hitbox = null;
    this.cooldown = 0;
    this.x = x;
    this.y = GROUND_Y - this.height;
    this.color = color;
    this.isAi = isAi;
    this.isCustom = false;
    this.genome = genome;
  }
  /**
   * Main update loop - called every frame
   * 
   * This is the heart of the fighter simulation:
   * 1. Handle death state physics
   * 2. Process AI decisions (if AI)
   * 3. Apply fitness shaping rewards (training)
   * 4. Handle energy regeneration
   * 5. Process input and state changes
   * 6. Activate hitboxes during attacks
   * 7. Apply physics integration
   * 8. Enforce boundaries
   * 
   * @param input - Control signals (from human or passed through for AI)
   * @param opponent - Reference to the other fighter
   */
  update(input, opponent) {
    if (this.handleDeathState()) return;
    let activeInput = input;
    if (this.isCustom && this.scriptWorker) {
      activeInput = this.processCustom(opponent);
    } else if (this.isAi && this.genome) {
      activeInput = this.processAi(opponent);
      applyFitnessShaping(this, opponent, this.genome);
    }
    this.updateEnergyAndCooldowns();
    this.handleMovementAndStates(activeInput);
    this.handleAttacks(activeInput);
    this.updateHitboxes();
    this.updatePhysicsBounding();
  }
  // ===========================================================================
  // PRIVATE HELPER METHODS (Decomposed from update loop)
  // ===========================================================================
  /** Handles death physics (ragdoll). Returns true if dead. */
  handleDeathState() {
    if (this.health > 0) return false;
    this.y += this.vy;
    this.vy += GRAVITY;
    if (this.y > GROUND_Y - 40) {
      this.y = GROUND_Y - 40;
      this.vx *= 0.5;
      this.vy = 0;
    } else {
      this.x += this.vx;
    }
    return true;
  }
  /** Updates energy regeneration and action cooldowns */
  updateEnergyAndCooldowns() {
    if (this.cooldown > 0) this.cooldown--;
    const isIdle = Math.abs(this.vx) < 0.5 && this.state === FighterAction.IDLE;
    const regenRate = isIdle ? ENERGY.REGEN_IDLE : ENERGY.REGEN_ACTIVE;
    if (this.energy < ENERGY.MAX) this.energy += regenRate;
  }
  /** Handles movement logic and state transitions (Jump, Crouch, Block, Move) */
  handleMovementAndStates(activeInput) {
    const isAnimationLocked = this.cooldown > 5;
    if (isAnimationLocked) return;
    if (activeInput.left && this.energy >= ENERGY.COST_MOVE) {
      this.vx -= 1.5;
      this.energy -= ENERGY.COST_MOVE;
      this.direction = -1;
      this.state = FighterAction.MOVE_LEFT;
    } else if (activeInput.right && this.energy >= ENERGY.COST_MOVE) {
      this.vx += 1.5;
      this.energy -= ENERGY.COST_MOVE;
      this.direction = 1;
      this.state = FighterAction.MOVE_RIGHT;
    } else {
      this.state = FighterAction.IDLE;
    }
    if (activeInput.up && this.y >= GROUND_Y - this.height - 1 && this.energy >= ENERGY.COST_JUMP) {
      this.vy = -18;
      this.energy -= ENERGY.COST_JUMP;
      this.state = FighterAction.JUMP;
    }
    if (activeInput.down && this.y >= GROUND_Y - this.height - 1 && this.energy >= ENERGY.COST_CROUCH) {
      this.state = FighterAction.CROUCH;
      this.energy -= ENERGY.COST_CROUCH;
      this.vx *= 0.5;
    }
    if (activeInput.action3 && this.energy >= ENERGY.COST_BLOCK) {
      this.state = FighterAction.BLOCK;
      this.energy -= ENERGY.COST_BLOCK;
      this.vx *= 0.3;
    }
  }
  /** Handles attack initiation (Punch, Kick) */
  handleAttacks(activeInput) {
    if (this.cooldown > 0) return;
    if (activeInput.action1 && this.energy >= ENERGY.COST_PUNCH) {
      this.state = FighterAction.PUNCH;
      this.vx *= 0.2;
      this.cooldown = 20;
      this.energy -= ENERGY.COST_PUNCH;
    } else if (activeInput.action2 && this.energy >= ENERGY.COST_KICK) {
      this.state = FighterAction.KICK;
      this.vx *= 0.2;
      this.cooldown = 20;
      this.energy -= ENERGY.COST_KICK;
    }
  }
  /** Updates active hitbox based on current animation state */
  updateHitboxes() {
    this.hitbox = null;
    if (this.state === FighterAction.PUNCH && this.cooldown < 15 && this.cooldown > 5) {
      this.hitbox = {
        x: this.direction === 1 ? this.x + this.width : this.x - 46,
        y: this.y + 20,
        w: 46,
        h: 20
      };
    } else if (this.state === FighterAction.KICK && this.cooldown < 15 && this.cooldown > 5) {
      this.hitbox = {
        x: this.direction === 1 ? this.x + this.width : this.x - 66,
        y: this.y + 40,
        w: 66,
        h: 30
      };
    }
  }
  /** Applies physics integration and enforces boundaries */
  updatePhysicsBounding() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += GRAVITY;
    this.vx *= FRICTION;
    if (this.y > GROUND_Y - this.height) {
      this.y = GROUND_Y - this.height;
      this.vy = 0;
      if (this.state === FighterAction.JUMP) this.state = FighterAction.IDLE;
    }
    if (this.x < 0) this.x = 0;
    if (this.x > CANVAS_WIDTH - this.width) this.x = CANVAS_WIDTH - this.width;
  }
  /**
   * AI Decision Making via Neural Network
   * 
   * Converts the current game state into neural network inputs,
   * runs the forward pass, and interprets outputs as actions.
   * 
   * INPUT NORMALIZATION
   * -------------------
   * All inputs are normalized to roughly [-1, 1] or [0, 1] range:
   * - This helps the network learn effectively
   * - Different scales would cause some inputs to dominate
   * 
   * OUTPUT INTERPRETATION
   * ---------------------
   * Each output neuron corresponds to an action.
   * If output > 0.5, that action is triggered.
   * Multiple actions can be triggered simultaneously.
   * 
   * @param opponent - The other fighter
   * @returns InputState object with boolean action flags
   */
  processAi(opponent) {
    if (!this.genome) {
      return { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };
    }
    const dist = (opponent.x - this.x) / CANVAS_WIDTH;
    const distY = (opponent.y - this.y) / CANVAS_HEIGHT;
    const selfH = this.health / 100;
    const oppH = opponent.health / 100;
    const oppAction = opponent.state / 7;
    const selfE = this.energy / ENERGY.MAX;
    const facing = this.direction;
    const oppCooldown = opponent.cooldown / 40;
    const oppEnergy = opponent.energy / ENERGY.MAX;
    const inputs = [dist, distY, selfH, oppH, oppAction, selfE, facing, oppCooldown, oppEnergy];
    this.lastInputs = inputs;
    let outputs;
    if (this.genome.network instanceof FeedForwardNetwork) {
      outputs = this.genome.network.predict(inputs);
    } else {
      outputs = predict(this.genome.network, inputs);
    }
    return {
      left: outputs[FighterAction.MOVE_LEFT] > 0.5,
      right: outputs[FighterAction.MOVE_RIGHT] > 0.5,
      up: outputs[FighterAction.JUMP] > 0.5,
      down: outputs[FighterAction.CROUCH] > 0.5,
      action1: outputs[FighterAction.PUNCH] > 0.5,
      action2: outputs[FighterAction.KICK] > 0.5,
      action3: outputs[FighterAction.BLOCK] > 0.5
    };
  }
  /**
   * Custom Script Decision Making via User-Defined JavaScript
   * 
   * Similar to processScripted, but uses the user's custom code
   * that was compiled and stored in customScriptFn.
   * 
   * @param opponent - The other fighter
   * @returns InputState object with boolean action flags
   */
  processCustom(opponent) {
    if (!this.scriptWorker || !this.scriptWorker.isReady()) {
      return { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };
    }
    const selfState = {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      health: this.health,
      energy: this.energy,
      state: this.state,
      direction: this.direction,
      cooldown: this.cooldown,
      width: this.width,
      height: this.height
    };
    const opponentState = {
      x: opponent.x,
      y: opponent.y,
      vx: opponent.vx,
      vy: opponent.vy,
      health: opponent.health,
      energy: opponent.energy,
      state: opponent.state,
      direction: opponent.direction,
      cooldown: opponent.cooldown,
      width: opponent.width,
      height: opponent.height
    };
    this.scriptWorker.requestAction(selfState, opponentState);
    return this.scriptWorker.getAction();
  }
  /**
   * Checks if this fighter's attack hits the opponent
   * 
   * COLLISION DETECTION
   * -------------------
   * Uses AABB (Axis-Aligned Bounding Box) collision detection:
   * Two rectangles overlap if they overlap on BOTH axes.
   * 
   * DAMAGE CALCULATION
   * ------------------
   * Base damage: Punch = 5, Kick = 10
   * Multipliers:
   * - Blocked: 0.5x (50% damage reduction)
   * - Normal: 1.0x
   * - Backstab: 3.0x (facing away from attacker)
   * 
   * KNOCKBACK
   * ---------
   * On hit, the defender is pushed back with velocity.
   * Kicks have stronger knockback than punches.
   * 
   * @param opponent - The fighter to check collision against
   */
  checkHit(opponent) {
    if (this.hitbox && opponent.health > 0) {
      const hit = this.hitbox.x < opponent.x + opponent.width && this.hitbox.x + this.hitbox.w > opponent.x && this.hitbox.y < opponent.y + opponent.height && this.hitbox.y + this.hitbox.h > opponent.y;
      if (hit) {
        const attackerToRight = this.x > opponent.x;
        attackerToRight && opponent.direction === -1 || !attackerToRight && opponent.direction === 1;
        let damage = this.state === FighterAction.PUNCH ? 5 : 10;
        if (opponent.state === FighterAction.BLOCK) {
          damage *= 0.5;
          opponent.energy -= ENERGY.PENALTY_HIT;
        } else if (opponent.state === FighterAction.CROUCH) {
          if (this.state === FighterAction.KICK) {
            damage *= 0.25;
          } else {
            damage *= 0.5;
          }
          opponent.energy -= ENERGY.PENALTY_HIT;
        }
        opponent.health = Math.max(0, opponent.health - damage);
        opponent.vx = this.direction * (this.state === FighterAction.KICK ? 15 : 8);
        opponent.vy = -5;
        this.hitbox = null;
      }
    }
  }
}
function renderBackground(ctx, frameCount) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, "#020617");
  gradient.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 50; i++) {
    const x = i * 137.5 % CANVAS_WIDTH;
    const y = i * 293.3 % (CANVAS_HEIGHT * 0.6);
    const size = i % 3 === 0 ? 1.5 : 0.8;
    const opacity = 0.3 + Math.sin(i + frameCount * 0.02) * 0.2;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#111827";
  for (let i = 0; i < CANVAS_WIDTH; i += 60) {
    const h = 80 + Math.sin(i * 0.02) * 40 + i % 100;
    ctx.fillRect(i, CANVAS_HEIGHT - 100 - h, 40, h + 100);
    ctx.fillStyle = "#374151";
    if (i % 3 === 0) {
      for (let w = 0; w < h; w += 20) {
        if ((i + w) % 5 !== 0) ctx.fillRect(i + 10, CANVAS_HEIGHT - 100 - h + w + 10, 5, 8);
      }
    }
    ctx.fillStyle = "#111827";
  }
  ctx.fillStyle = "#1f2937";
  for (let i = 30; i < CANVAS_WIDTH; i += 80) {
    const h = 40 + Math.cos(i * 0.03) * 30 + i % 70;
    ctx.fillRect(i, CANVAS_HEIGHT - 80 - h, 50, h + 80);
    ctx.strokeStyle = "#4b5563";
    ctx.lineWidth = 1;
    ctx.strokeRect(i, CANVAS_HEIGHT - 80 - h, 50, h + 80);
  }
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 35);
  ctx.strokeStyle = "#15803d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = -CANVAS_WIDTH; i < CANVAS_WIDTH * 2; i += 60) {
    ctx.moveTo(i, CANVAS_HEIGHT - 35);
    ctx.lineTo((i - CANVAS_WIDTH / 2) * 4 + CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  }
  for (let y = CANVAS_HEIGHT - 35; y < CANVAS_HEIGHT; y += 15) {
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
  }
  ctx.stroke();
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 3);
}
function renderStickman(ctx, fighter, frameCount) {
  const { x, y, width, height, color, direction, state, health } = fighter;
  const isDead = health <= 0;
  const cx = x + width / 2;
  const bottomY = y + height;
  const topY = y;
  let shoulderY = topY + 25;
  const hipY = bottomY - 45;
  const mainColor = color;
  const jointColor = "#fff";
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  let headOffset = { x: 0, y: 0 };
  let torsoAngle = 0;
  let lArm = { elbow: { x: -15, y: 15 }, hand: { x: -10, y: -10 } };
  let rArm = { elbow: { x: 15, y: 15 }, hand: { x: 25, y: 0 } };
  let lLeg = { knee: { x: -5, y: 20 }, foot: { x: -10, y: 45 } };
  let rLeg = { knee: { x: 10, y: 20 }, foot: { x: 15, y: 45 } };
  const dir = direction;
  if (isDead) {
    ctx.beginPath();
    ctx.arc(cx - 30 * dir, bottomY - 10, 10, 0, Math.PI * 2);
    ctx.moveTo(cx - 20 * dir, bottomY - 5);
    ctx.lineTo(cx + 10 * dir, bottomY - 5);
    ctx.moveTo(cx - 10 * dir, bottomY - 5);
    ctx.lineTo(cx - 10 * dir, bottomY - 25);
    ctx.moveTo(cx + 10 * dir, bottomY - 5);
    ctx.lineTo(cx + 30 * dir, bottomY - 5);
    ctx.stroke();
    ctx.shadowBlur = 0;
    return;
  }
  switch (state) {
    case FighterAction.IDLE:
      headOffset.y = Math.sin(frameCount * 0.1) * 2;
      lArm = { elbow: { x: 10 * dir, y: 20 }, hand: { x: 20 * dir, y: -10 } };
      rArm = { elbow: { x: 15 * dir, y: 20 }, hand: { x: 25 * dir, y: -5 } };
      lLeg = { knee: { x: -5 * dir, y: 20 }, foot: { x: -15 * dir, y: 45 } };
      rLeg = { knee: { x: 10 * dir, y: 20 }, foot: { x: 20 * dir, y: 45 } };
      break;
    case FighterAction.MOVE_LEFT:
    case FighterAction.MOVE_RIGHT:
      const wSpeed = 0.25;
      const t = frameCount * wSpeed;
      const stride = 20;
      headOffset.y = Math.abs(Math.cos(t)) * 3;
      const getLeg = (phaseOffset) => {
        const localT = t + phaseOffset;
        const sinT = Math.sin(localT);
        const cosT = Math.cos(localT);
        const x2 = sinT * stride;
        const liftParams = Math.max(0, cosT);
        const footLift = liftParams * 12;
        const kneeLift = liftParams * 8;
        return {
          knee: { x: x2 * dir, y: 20 - kneeLift },
          foot: { x: x2 * 1.6 * dir, y: 45 - footLift }
        };
      };
      rLeg = getLeg(0);
      lLeg = getLeg(Math.PI);
      lArm = {
        elbow: { x: Math.sin(t) * 12 * dir, y: 20 },
        hand: { x: Math.sin(t) * 22 * dir, y: 15 }
      };
      rArm = {
        elbow: { x: Math.sin(t + Math.PI) * 12 * dir, y: 20 },
        hand: { x: Math.sin(t + Math.PI) * 22 * dir, y: 15 }
      };
      break;
    case FighterAction.PUNCH:
      torsoAngle = 10 * dir * (Math.PI / 180);
      rArm = { elbow: { x: 20 * dir, y: 0 }, hand: { x: 45 * dir, y: -5 } };
      lArm = { elbow: { x: 5 * dir, y: 20 }, hand: { x: 15 * dir, y: -15 } };
      lLeg = { knee: { x: -15 * dir, y: 25 }, foot: { x: -30 * dir, y: 45 } };
      rLeg = { knee: { x: 15 * dir, y: 20 }, foot: { x: 20 * dir, y: 45 } };
      break;
    case FighterAction.KICK:
      torsoAngle = -15 * dir * (Math.PI / 180);
      rLeg = { knee: { x: 20 * dir, y: 0 }, foot: { x: 50 * dir, y: -20 } };
      lLeg = { knee: { x: -5 * dir, y: 20 }, foot: { x: -5 * dir, y: 45 } };
      lArm = { elbow: { x: -15 * dir, y: 10 }, hand: { x: -25 * dir, y: 0 } };
      rArm = { elbow: { x: 10 * dir, y: 20 }, hand: { x: 15 * dir, y: 20 } };
      break;
    case FighterAction.BLOCK:
      lArm = { elbow: { x: 15 * dir, y: 10 }, hand: { x: 20 * dir, y: -20 } };
      rArm = { elbow: { x: 15 * dir, y: 10 }, hand: { x: 20 * dir, y: -20 } };
      headOffset.y = 5;
      break;
    case FighterAction.JUMP:
      lLeg = { knee: { x: -10 * dir, y: 10 }, foot: { x: -10 * dir, y: 25 } };
      rLeg = { knee: { x: 10 * dir, y: 15 }, foot: { x: 10 * dir, y: 30 } };
      break;
    case FighterAction.CROUCH:
      shoulderY += 20;
      lLeg = { knee: { x: -20 * dir, y: 10 }, foot: { x: -20 * dir, y: 25 } };
      rLeg = { knee: { x: 20 * dir, y: 10 }, foot: { x: 20 * dir, y: 25 } };
      break;
  }
  const drawJoint = (jx, jy) => {
    const oldStyle = ctx.fillStyle;
    ctx.fillStyle = jointColor;
    ctx.beginPath();
    ctx.arc(jx, jy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = oldStyle;
  };
  ctx.beginPath();
  ctx.fillStyle = "#f1f5f9";
  const headX = cx + headOffset.x + torsoAngle * 20;
  const headY = topY + 15 + headOffset.y;
  ctx.arc(headX, headY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(headX - 10, headY - 5);
  ctx.lineTo(headX + 10, headY - 5);
  ctx.stroke();
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 8;
  ctx.beginPath();
  const torsoTopX = cx + torsoAngle * 10;
  const torsoTopY = shoulderY;
  const torsoBotX = cx;
  const torsoBotY = hipY;
  ctx.moveTo(torsoTopX, torsoTopY);
  ctx.lineTo(torsoBotX, torsoBotY);
  ctx.stroke();
  ctx.lineWidth = 6;
  const drawLimb = (originX, originY, config) => {
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    const kX = originX + (config.knee?.x || config.elbow?.x);
    const kY = originY + (config.knee?.y || config.elbow?.y);
    ctx.lineTo(kX, kY);
    const eX = originX + (config.foot?.x || config.hand?.x);
    const eY = originY + (config.foot?.y || config.hand?.y);
    ctx.lineTo(eX, eY);
    ctx.stroke();
    drawJoint(originX, originY);
    drawJoint(kX, kY);
  };
  if (dir === 1) {
    drawLimb(torsoBotX, torsoBotY, lLeg);
    drawLimb(torsoTopX, torsoTopY, lArm);
  } else {
    drawLimb(torsoBotX, torsoBotY, rLeg);
    drawLimb(torsoTopX, torsoTopY, rArm);
  }
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(torsoTopX, torsoTopY);
  ctx.lineTo(torsoBotX, torsoBotY);
  ctx.stroke();
  if (dir === 1) {
    drawLimb(torsoBotX, torsoBotY, rLeg);
    drawLimb(torsoTopX, torsoTopY, rArm);
  } else {
    drawLimb(torsoBotX, torsoBotY, lLeg);
    drawLimb(torsoTopX, torsoTopY, lArm);
  }
  ctx.shadowBlur = 0;
  const hpPercent = health / 100;
  ctx.fillStyle = "rgba(30, 41, 59, 0.8)";
  ctx.fillRect(x - 5, y - 35, 60, 10);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#475569";
  ctx.strokeRect(x - 5, y - 35, 60, 10);
  ctx.fillStyle = hpPercent > 0.5 ? "#22c55e" : hpPercent > 0.2 ? "#eab308" : "#ef4444";
  ctx.fillRect(x - 4, y - 34, 58 * hpPercent, 8);
  ctx.fillStyle = "#eab308";
  ctx.fillRect(x - 5, y - 23, 60 * (fighter.energy / 100), 2);
}
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "GameCanvas",
  __ssrInlineRender: true,
  props: {
    player1: {},
    player2: {},
    isTraining: { type: Boolean, default: false },
    roundNumber: { default: 0 }
  },
  setup(__props) {
    const props = __props;
    const canvasRef = ref(null);
    const frameRef = ref(0);
    watchEffect(() => {
      const canvas = canvasRef.value;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      frameRef.value++;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      renderBackground(ctx, frameRef.value);
      const swapSides = props.isTraining && props.roundNumber % 2 === 1;
      if (swapSides) {
        renderStickman(ctx, props.player2, frameRef.value);
        renderStickman(ctx, props.player1, frameRef.value);
      } else {
        renderStickman(ctx, props.player1, frameRef.value);
        renderStickman(ctx, props.player2, frameRef.value);
      }
      if ((props.player1.state === FighterAction.PUNCH || props.player1.state === FighterAction.KICK) && props.player1.hitbox) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        const h = props.player1.hitbox;
        ctx.arc(h.x + h.w / 2, h.y + h.h / 2, 15, 0, Math.PI * 2);
        ctx.fill();
      }
      if ((props.player2.state === FighterAction.PUNCH || props.player2.state === FighterAction.KICK) && props.player2.hitbox) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        const h = props.player2.hitbox;
        ctx.arc(h.x + h.w / 2, h.y + h.h / 2, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<canvas${ssrRenderAttrs(mergeProps({
        ref_key: "canvasRef",
        ref: canvasRef,
        width: unref(CANVAS_WIDTH),
        height: unref(CANVAS_HEIGHT),
        class: "rounded-lg shadow-2xl border-2 border-slate-600 w-full max-w-4xl bg-black"
      }, _attrs))}></canvas>`);
    };
  }
});
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/GameCanvas.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const __nuxt_component_1$1 = Object.assign(_sfc_main$h, { __name: "GameCanvas" });
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "GameArena",
  __ssrInlineRender: true,
  props: {
    activeMatch: {},
    gameState: {},
    settings: {},
    currentMatchIndex: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GameHUD = __nuxt_component_0$1;
      const _component_GameCanvas = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative group" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_GameHUD, {
        "active-match": __props.activeMatch,
        "game-state": __props.gameState,
        settings: __props.settings,
        "current-match-index": __props.currentMatchIndex
      }, null, _parent));
      if (__props.activeMatch) {
        _push(ssrRenderComponent(_component_GameCanvas, {
          player1: __props.activeMatch.p1,
          player2: __props.activeMatch.p2,
          "is-training": __props.settings.gameMode === "TRAINING",
          "round-number": __props.currentMatchIndex
        }, null, _parent));
      } else {
        _push(`<div class="w-full h-[450px] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-700"><span class="text-slate-400 font-mono">Initializing Arena...</span></div>`);
      }
      if (!__props.gameState.matchActive && __props.gameState.roundStatus === "FIGHTING") {
        _push(`<div class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl"><div class="text-center"><h2 class="text-5xl font-black text-white italic tracking-tighter mb-2">${ssrInterpolate(__props.gameState.winner === "Player 1" ? "VICTORY" : "DEFEAT")}</h2><p class="text-slate-400 font-mono">RESTARTING MATCH...</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/GameArena.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$g, { __name: "GameArena" });
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "ControlsHelper",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs font-mono text-slate-500" }, _attrs))}><div class="flex flex-col gap-1"><span class="text-slate-300 font-bold">MOVE</span><span>WASD / ARROWS</span></div><div class="flex flex-col gap-1"><span class="text-slate-300 font-bold">PUNCH</span><span>J / SPACE / Z</span></div><div class="flex flex-col gap-1"><span class="text-slate-300 font-bold">KICK</span><span>K / X</span></div><div class="flex flex-col gap-1"><span class="text-slate-300 font-bold">BLOCK</span><span>L / C / SHIFT</span></div></div>`);
    };
  }
});
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ControlsHelper.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const __nuxt_component_3$1 = Object.assign(_sfc_main$f, { __name: "ControlsHelper" });
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "TouchControls",
  __ssrInlineRender: true,
  props: {
    inputManager: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full lg:hidden flex justify-between items-end px-2 sm:px-4 pb-4 select-none touch-none" }, _attrs))}><div class="flex justify-between items-end w-full max-w-lg mx-auto"><div class="relative w-40 h-40 pointer-events-auto opacity-70"><button class="absolute flex items-center justify-center touch-none select-none top-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-slate-700/80 rounded-t-lg border border-slate-500 active:bg-slate-500/80"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg></button><button class="absolute flex items-center justify-center touch-none select-none bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-slate-700/80 rounded-b-lg border border-slate-500 active:bg-slate-500/80"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg></button><button class="absolute flex items-center justify-center touch-none select-none left-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-700/80 rounded-l-lg border border-slate-500 active:bg-slate-500/80"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg></button><button class="absolute flex items-center justify-center touch-none select-none right-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-700/80 rounded-r-lg border border-slate-500 active:bg-slate-500/80"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></button><div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-800 rounded-full border border-slate-600"></div></div><div class="relative w-40 h-40 pointer-events-auto opacity-80"><button class="absolute flex items-center justify-center touch-none select-none top-0 right-10 w-16 h-16 bg-red-600/80 rounded-full border-2 border-red-400 active:bg-red-500/80 shadow-lg"><span class="font-black text-white text-xl">P</span></button><button class="absolute flex items-center justify-center touch-none select-none bottom-8 left-2 w-16 h-16 bg-blue-600/80 rounded-full border-2 border-blue-400 active:bg-blue-500/80 shadow-lg"><span class="font-black text-white text-xl">K</span></button><button class="absolute flex items-center justify-center touch-none select-none bottom-0 right-0 w-12 h-12 bg-amber-600/80 rounded-full border-2 border-amber-400 active:bg-amber-500/80 shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></button></div></div></div>`);
    };
  }
});
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TouchControls.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$e, { __name: "TouchControls" });
const NODE_RADIUS = 4;
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "NeuralNetworkVisualizer",
  __ssrInlineRender: true,
  props: {
    fighter: {},
    width: { default: 600 },
    height: { default: 200 },
    className: { default: "" }
  },
  setup(__props) {
    const props = __props;
    const canvasRef = ref(null);
    const INPUT_LABELS = ["Dist X", "Dist Y", "My HP", "Op HP", "Op Act", "My En", "Face", "Op CD", "Op En"];
    const OUTPUT_LABELS = ["Idle", "Left", "Right", "Jump", "Crouch", "Punch", "Kick", "Block"];
    const getNodeColor = (value) => {
      const brightness = Math.min(1, Math.max(0.2, value));
      return `rgba(0, 255, 255, ${brightness})`;
    };
    const getLineColor = (weight, activation) => {
      const strength = Math.abs(weight) * activation;
      const opacity = Math.min(1, Math.pow(strength, 1.5) * 0.8);
      if (opacity < 0.02) return "transparent";
      return weight > 0 ? `rgba(0, 240, 255, ${opacity})` : `rgba(255, 40, 40, ${opacity})`;
    };
    watchEffect(() => {
      const canvas = canvasRef.value;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const render = () => {
        const width = props.width ?? 600;
        const height = props.height ?? 200;
        ctx.clearRect(0, 0, width, height);
        if (!props.fighter || !props.fighter.genome) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.font = "14px Inter, sans-serif";
          const text = "Waiting for Neural Network...";
          const textWidth = ctx.measureText(text).width;
          ctx.fillText(text, (width - textWidth) / 2, height / 2);
          requestAnimationFrame(render);
          return;
        }
        const network = props.fighter.genome.network;
        const inputs = props.fighter.lastInputs || new Array(9).fill(0);
        let hiddenOutputs = [];
        let finalOutputs = [];
        const inputWeights = network.inputWeights;
        const outputWeights = network.outputWeights;
        const netInstance = network;
        if (typeof netInstance.getActivations === "function") {
          const activations = netInstance.getActivations(inputs);
          hiddenOutputs = activations.hidden;
          finalOutputs = activations.output;
        } else {
          const biases = network.biases;
          for (let h = 0; h < HIDDEN_NODES; h++) {
            let sum = 0;
            for (let i = 0; i < inputs.length; i++) {
              const inputVal = inputs[i];
              const weight = inputWeights[i]?.[h];
              if (inputVal !== void 0 && weight !== void 0) {
                sum += inputVal * weight;
              }
            }
            const bias = biases[h];
            if (bias !== void 0) {
              sum += bias;
            }
            hiddenOutputs.push(relu(sum));
          }
          for (let o = 0; o < OUTPUT_NODES; o++) {
            let sum = 0;
            for (let h = 0; h < HIDDEN_NODES; h++) {
              const hiddenVal = hiddenOutputs[h];
              const weight = outputWeights[h]?.[o];
              if (hiddenVal !== void 0 && weight !== void 0) {
                sum += hiddenVal * weight;
              }
            }
            const bias = biases[HIDDEN_NODES + o];
            if (bias !== void 0) {
              sum += bias;
            }
            finalOutputs.push(sigmoid(sum));
          }
        }
        const inputX = 60;
        const hiddenX = width / 2;
        const outputX = width - 60;
        const inputStep = height / (inputs.length + 1);
        const hiddenStep = height / (HIDDEN_NODES + 1);
        const outputStep = height / (OUTPUT_NODES + 1);
        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i < inputs.length; i++) {
          const y1 = (i + 1) * inputStep;
          for (let h = 0; h < HIDDEN_NODES; h++) {
            const y2 = (h + 1) * hiddenStep;
            const weight = inputWeights[i]?.[h] ?? 0;
            const inputVal = inputs[i] ?? 0;
            const color = getLineColor(weight, Math.abs(inputVal));
            if (color !== "transparent") {
              ctx.beginPath();
              ctx.moveTo(inputX, y1);
              ctx.lineTo(hiddenX, y2);
              ctx.strokeStyle = color;
              ctx.lineWidth = Math.max(0.1, Math.abs(weight) * 0.5);
              ctx.stroke();
            }
          }
        }
        for (let h = 0; h < HIDDEN_NODES; h++) {
          const y1 = (h + 1) * hiddenStep;
          for (let o = 0; o < OUTPUT_NODES; o++) {
            const y2 = (o + 1) * outputStep;
            const weight = outputWeights[h]?.[o] ?? 0;
            const hiddenVal = hiddenOutputs[h] ?? 0;
            const color = getLineColor(weight, hiddenVal);
            if (color !== "transparent") {
              ctx.beginPath();
              ctx.moveTo(hiddenX, y1);
              ctx.lineTo(outputX, y2);
              ctx.strokeStyle = color;
              ctx.lineWidth = Math.max(0.1, Math.abs(weight) * 0.5);
              ctx.stroke();
            }
          }
        }
        ctx.globalCompositeOperation = "source-over";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.font = "10px Inter, monospace";
        for (let i = 0; i < inputs.length; i++) {
          const y = (i + 1) * inputStep;
          ctx.beginPath();
          ctx.arc(inputX, y, NODE_RADIUS, 0, Math.PI * 2);
          const inputVal = inputs[i] ?? 0;
          ctx.fillStyle = getNodeColor(Math.abs(inputVal));
          ctx.fill();
          ctx.strokeStyle = "#333";
          ctx.stroke();
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          const label = INPUT_LABELS[i] ?? "";
          ctx.fillText(label, inputX - 10, y);
        }
        for (let h = 0; h < HIDDEN_NODES; h++) {
          const y = (h + 1) * hiddenStep;
          ctx.beginPath();
          ctx.arc(hiddenX, y, NODE_RADIUS, 0, Math.PI * 2);
          const hiddenVal = hiddenOutputs[h] ?? 0;
          ctx.fillStyle = getNodeColor(hiddenVal);
          ctx.fill();
        }
        ctx.textAlign = "left";
        for (let o = 0; o < OUTPUT_NODES; o++) {
          const y = (o + 1) * outputStep;
          const outputVal = finalOutputs[o] ?? 0;
          ctx.beginPath();
          ctx.arc(outputX, y, NODE_RADIUS + (outputVal > 0.5 ? 2 : 0), 0, Math.PI * 2);
          ctx.fillStyle = outputVal > 0.5 ? "#00FFFF" : getNodeColor(outputVal);
          ctx.fill();
          ctx.strokeStyle = "#333";
          ctx.stroke();
          ctx.fillStyle = outputVal > 0.5 ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)";
          ctx.font = outputVal > 0.5 ? "bold 10px Inter, monospace" : "10px Inter, monospace";
          const outputLabel = OUTPUT_LABELS[o] ?? "";
          ctx.fillText(outputLabel, outputX + 10, y);
        }
        requestAnimationFrame(render);
      };
      render();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-2xl relative", __props.className]
      }, _attrs))}><div class="absolute top-2 left-0 right-0 text-center pointer-events-none"><span class="text-xs text-white/30 uppercase tracking-[0.2em] font-bold">Neural Network Architecture</span></div><canvas${ssrRenderAttr("width", __props.width)}${ssrRenderAttr("height", __props.height)} class="block w-full h-auto"></canvas></div>`);
    };
  }
});
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/NeuralNetworkVisualizer.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$d, { __name: "NeuralNetworkVisualizer" });
const theme$4 = {
  "slots": {
    "base": "font-medium inline-flex items-center",
    "label": "truncate",
    "leadingIcon": "shrink-0",
    "leadingAvatar": "shrink-0",
    "leadingAvatarSize": "",
    "trailingIcon": "shrink-0"
  },
  "variants": {
    "fieldGroup": {
      "horizontal": "not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none focus-visible:z-[1]",
      "vertical": "not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none focus-visible:z-[1]"
    },
    "color": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "variant": {
      "solid": "",
      "outline": "",
      "soft": "",
      "subtle": ""
    },
    "size": {
      "xs": {
        "base": "text-[8px]/3 px-1 py-0.5 gap-1 rounded-sm",
        "leadingIcon": "size-3",
        "leadingAvatarSize": "3xs",
        "trailingIcon": "size-3"
      },
      "sm": {
        "base": "text-[10px]/3 px-1.5 py-1 gap-1 rounded-sm",
        "leadingIcon": "size-3",
        "leadingAvatarSize": "3xs",
        "trailingIcon": "size-3"
      },
      "md": {
        "base": "text-xs px-2 py-1 gap-1 rounded-md",
        "leadingIcon": "size-4",
        "leadingAvatarSize": "3xs",
        "trailingIcon": "size-4"
      },
      "lg": {
        "base": "text-sm px-2 py-1 gap-1.5 rounded-md",
        "leadingIcon": "size-5",
        "leadingAvatarSize": "2xs",
        "trailingIcon": "size-5"
      },
      "xl": {
        "base": "text-base px-2.5 py-1 gap-1.5 rounded-md",
        "leadingIcon": "size-6",
        "leadingAvatarSize": "2xs",
        "trailingIcon": "size-6"
      }
    },
    "square": {
      "true": ""
    }
  },
  "compoundVariants": [
    {
      "color": "primary",
      "variant": "solid",
      "class": "bg-primary text-inverted"
    },
    {
      "color": "secondary",
      "variant": "solid",
      "class": "bg-secondary text-inverted"
    },
    {
      "color": "success",
      "variant": "solid",
      "class": "bg-success text-inverted"
    },
    {
      "color": "info",
      "variant": "solid",
      "class": "bg-info text-inverted"
    },
    {
      "color": "warning",
      "variant": "solid",
      "class": "bg-warning text-inverted"
    },
    {
      "color": "error",
      "variant": "solid",
      "class": "bg-error text-inverted"
    },
    {
      "color": "primary",
      "variant": "outline",
      "class": "text-primary ring ring-inset ring-primary/50"
    },
    {
      "color": "secondary",
      "variant": "outline",
      "class": "text-secondary ring ring-inset ring-secondary/50"
    },
    {
      "color": "success",
      "variant": "outline",
      "class": "text-success ring ring-inset ring-success/50"
    },
    {
      "color": "info",
      "variant": "outline",
      "class": "text-info ring ring-inset ring-info/50"
    },
    {
      "color": "warning",
      "variant": "outline",
      "class": "text-warning ring ring-inset ring-warning/50"
    },
    {
      "color": "error",
      "variant": "outline",
      "class": "text-error ring ring-inset ring-error/50"
    },
    {
      "color": "primary",
      "variant": "soft",
      "class": "bg-primary/10 text-primary"
    },
    {
      "color": "secondary",
      "variant": "soft",
      "class": "bg-secondary/10 text-secondary"
    },
    {
      "color": "success",
      "variant": "soft",
      "class": "bg-success/10 text-success"
    },
    {
      "color": "info",
      "variant": "soft",
      "class": "bg-info/10 text-info"
    },
    {
      "color": "warning",
      "variant": "soft",
      "class": "bg-warning/10 text-warning"
    },
    {
      "color": "error",
      "variant": "soft",
      "class": "bg-error/10 text-error"
    },
    {
      "color": "primary",
      "variant": "subtle",
      "class": "bg-primary/10 text-primary ring ring-inset ring-primary/25"
    },
    {
      "color": "secondary",
      "variant": "subtle",
      "class": "bg-secondary/10 text-secondary ring ring-inset ring-secondary/25"
    },
    {
      "color": "success",
      "variant": "subtle",
      "class": "bg-success/10 text-success ring ring-inset ring-success/25"
    },
    {
      "color": "info",
      "variant": "subtle",
      "class": "bg-info/10 text-info ring ring-inset ring-info/25"
    },
    {
      "color": "warning",
      "variant": "subtle",
      "class": "bg-warning/10 text-warning ring ring-inset ring-warning/25"
    },
    {
      "color": "error",
      "variant": "subtle",
      "class": "bg-error/10 text-error ring ring-inset ring-error/25"
    },
    {
      "color": "neutral",
      "variant": "solid",
      "class": "text-inverted bg-inverted"
    },
    {
      "color": "neutral",
      "variant": "outline",
      "class": "ring ring-inset ring-accented text-default bg-default"
    },
    {
      "color": "neutral",
      "variant": "soft",
      "class": "text-default bg-elevated"
    },
    {
      "color": "neutral",
      "variant": "subtle",
      "class": "ring ring-inset ring-accented text-default bg-elevated"
    },
    {
      "size": "xs",
      "square": true,
      "class": "p-0.5"
    },
    {
      "size": "sm",
      "square": true,
      "class": "p-1"
    },
    {
      "size": "md",
      "square": true,
      "class": "p-1"
    },
    {
      "size": "lg",
      "square": true,
      "class": "p-1"
    },
    {
      "size": "xl",
      "square": true,
      "class": "p-1"
    }
  ],
  "defaultVariants": {
    "color": "primary",
    "variant": "solid",
    "size": "md"
  }
};
const _sfc_main$c = {
  __name: "UBadge",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false, default: "span" },
    label: { type: [String, Number], required: false },
    color: { type: null, required: false },
    variant: { type: null, required: false },
    size: { type: null, required: false },
    square: { type: Boolean, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    icon: { type: null, required: false },
    avatar: { type: Object, required: false },
    leading: { type: Boolean, required: false },
    leadingIcon: { type: null, required: false },
    trailing: { type: Boolean, required: false },
    trailingIcon: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const { orientation, size: fieldGroupSize } = useFieldGroup(props);
    const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);
    const ui = computed(() => tv({ extend: tv(theme$4), ...appConfig.ui?.badge || {} })({
      color: props.color,
      variant: props.variant,
      size: fieldGroupSize.value || props.size,
      square: props.square || !slots.default && !props.label,
      fieldGroup: orientation.value
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-slot": "base",
        class: ui.value.base({ class: [props.ui?.base, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => {
              if (unref(isLeading) && unref(leadingIconName)) {
                _push2(ssrRenderComponent(_sfc_main$d$1, {
                  name: unref(leadingIconName),
                  "data-slot": "leadingIcon",
                  class: ui.value.leadingIcon({ class: props.ui?.leadingIcon })
                }, null, _parent2, _scopeId));
              } else if (!!__props.avatar) {
                _push2(ssrRenderComponent(_sfc_main$b$1, mergeProps({
                  size: props.ui?.leadingAvatarSize || ui.value.leadingAvatarSize()
                }, __props.avatar, {
                  "data-slot": "leadingAvatar",
                  class: ui.value.leadingAvatar({ class: props.ui?.leadingAvatar })
                }), null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            }, _push2, _parent2, _scopeId);
            ssrRenderSlot(_ctx.$slots, "default", { ui: ui.value }, () => {
              if (__props.label !== void 0 && __props.label !== null) {
                _push2(`<span data-slot="label" class="${ssrRenderClass(ui.value.label({ class: props.ui?.label }))}"${_scopeId}>${ssrInterpolate(__props.label)}</span>`);
              } else {
                _push2(`<!---->`);
              }
            }, _push2, _parent2, _scopeId);
            ssrRenderSlot(_ctx.$slots, "trailing", { ui: ui.value }, () => {
              if (unref(isTrailing) && unref(trailingIconName)) {
                _push2(ssrRenderComponent(_sfc_main$d$1, {
                  name: unref(trailingIconName),
                  "data-slot": "trailingIcon",
                  class: ui.value.trailingIcon({ class: props.ui?.trailingIcon })
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            }, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => [
                unref(isLeading) && unref(leadingIconName) ? (openBlock(), createBlock(_sfc_main$d$1, {
                  key: 0,
                  name: unref(leadingIconName),
                  "data-slot": "leadingIcon",
                  class: ui.value.leadingIcon({ class: props.ui?.leadingIcon })
                }, null, 8, ["name", "class"])) : !!__props.avatar ? (openBlock(), createBlock(_sfc_main$b$1, mergeProps({
                  key: 1,
                  size: props.ui?.leadingAvatarSize || ui.value.leadingAvatarSize()
                }, __props.avatar, {
                  "data-slot": "leadingAvatar",
                  class: ui.value.leadingAvatar({ class: props.ui?.leadingAvatar })
                }), null, 16, ["size", "class"])) : createCommentVNode("", true)
              ]),
              renderSlot(_ctx.$slots, "default", { ui: ui.value }, () => [
                __props.label !== void 0 && __props.label !== null ? (openBlock(), createBlock("span", {
                  key: 0,
                  "data-slot": "label",
                  class: ui.value.label({ class: props.ui?.label })
                }, toDisplayString(__props.label), 3)) : createCommentVNode("", true)
              ]),
              renderSlot(_ctx.$slots, "trailing", { ui: ui.value }, () => [
                unref(isTrailing) && unref(trailingIconName) ? (openBlock(), createBlock(_sfc_main$d$1, {
                  key: 0,
                  name: unref(trailingIconName),
                  "data-slot": "trailingIcon",
                  class: ui.value.trailingIcon({ class: props.ui?.trailingIcon })
                }, null, 8, ["name", "class"])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+ui@4.3.0_@babel+parser@7.28.5_@floating-ui+dom@1.7.4_@tiptap+extension-drag-handl_3a690419a02858a5ab0e0095ebe0c427/node_modules/@nuxt/ui/dist/runtime/components/Badge.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "ScriptEditor",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean },
    onSave: { type: Function, default: () => {
    } }
  },
  emits: ["update:modelValue", "save"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value)
    });
    const code = ref("");
    const error = ref(null);
    const isSaving = ref(false);
    const fileInputRef = ref(null);
    const editorContainer = ref(null);
    const activeSlot = ref("slot1");
    const switchSlot = (slot) => {
      activeSlot.value = slot;
    };
    watch([isOpen, activeSlot], () => {
      if (isOpen.value) {
        code.value = loadScript(activeSlot.value);
        error.value = null;
      }
    });
    watch(code, () => {
      if (code.value) {
        const result = compileScript(code.value);
        error.value = result.error || null;
      }
    });
    const handleSave = () => {
      isSaving.value = true;
      saveScript(code.value, activeSlot.value);
      props.onSave(code.value);
      emit("save", code.value);
      isSaving.value = false;
      emit("update:modelValue", false);
    };
    const handleReset = () => {
      if (confirm(`Load default template for ${activeSlot.value === "slot1" ? "Script A" : "Script B"}? Your current code will be replaced.`)) {
        const template = getDefaultTemplate();
        code.value = template;
        saveScript(template, activeSlot.value);
      }
    };
    const handleExport = () => {
      exportScript(code.value);
    };
    const handleImport = () => {
      fileInputRef.value?.click();
    };
    const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        const importedCode = importScript(content);
        if (importedCode) {
          code.value = importedCode;
        } else {
          alert("Invalid script file. Please select a valid exported script.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    };
    const onClose = () => {
      emit("update:modelValue", false);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UModal = _sfc_main$l;
      const _component_UCard = _sfc_main$k;
      const _component_UButton = _sfc_main$8$1;
      const _component_UBadge = _sfc_main$c;
      _push(ssrRenderComponent(_component_UModal, mergeProps({
        open: isOpen.value,
        "onUpdate:open": ($event) => isOpen.value = $event,
        ui: { width: "max-w-full", height: "max-h-full" }
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) ;
          else {
            return [];
          }
        }),
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UCard, { class: "h-[90vh] flex flex-col" }, {
              header: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex justify-between items-center"${_scopeId2}><div class="flex items-center gap-5"${_scopeId2}><h2 class="text-xl font-bold text-purple-400"${_scopeId2}> ✏️ Custom Fighter Script Editor </h2><div class="flex gap-1 bg-slate-800 p-1 rounded-lg"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UButton, {
                    color: activeSlot.value === "slot1" ? "success" : "neutral",
                    variant: activeSlot.value === "slot1" ? "solid" : "outline",
                    size: "xs",
                    onClick: ($event) => switchSlot("slot1")
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Script A `);
                      } else {
                        return [
                          createTextVNode(" Script A ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    color: activeSlot.value === "slot2" ? "success" : "neutral",
                    variant: activeSlot.value === "slot2" ? "solid" : "outline",
                    size: "xs",
                    onClick: ($event) => switchSlot("slot2")
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Script B `);
                      } else {
                        return [
                          createTextVNode(" Script B ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_UBadge, {
                    color: "gray",
                    variant: "subtle",
                    size: "sm"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` JavaScript `);
                      } else {
                        return [
                          createTextVNode(" JavaScript ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_UButton, {
                    icon: "i-heroicons-x-mark",
                    color: "neutral",
                    variant: "ghost",
                    onClick: onClose
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex justify-between items-center" }, [
                      createVNode("div", { class: "flex items-center gap-5" }, [
                        createVNode("h2", { class: "text-xl font-bold text-purple-400" }, " ✏️ Custom Fighter Script Editor "),
                        createVNode("div", { class: "flex gap-1 bg-slate-800 p-1 rounded-lg" }, [
                          createVNode(_component_UButton, {
                            color: activeSlot.value === "slot1" ? "success" : "neutral",
                            variant: activeSlot.value === "slot1" ? "solid" : "outline",
                            size: "xs",
                            onClick: ($event) => switchSlot("slot1")
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Script A ")
                            ]),
                            _: 1
                          }, 8, ["color", "variant", "onClick"]),
                          createVNode(_component_UButton, {
                            color: activeSlot.value === "slot2" ? "success" : "neutral",
                            variant: activeSlot.value === "slot2" ? "solid" : "outline",
                            size: "xs",
                            onClick: ($event) => switchSlot("slot2")
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Script B ")
                            ]),
                            _: 1
                          }, 8, ["color", "variant", "onClick"])
                        ]),
                        createVNode(_component_UBadge, {
                          color: "gray",
                          variant: "subtle",
                          size: "sm"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" JavaScript ")
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_UButton, {
                        icon: "i-heroicons-x-mark",
                        color: "neutral",
                        variant: "ghost",
                        onClick: onClose
                      })
                    ])
                  ];
                }
              }),
              footer: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex justify-between items-center gap-3"${_scopeId2}><div class="${ssrRenderClass([
                    "flex-1 text-sm font-mono p-2 rounded-lg",
                    error.value ? "text-red-500 bg-red-500/10" : "text-green-500 bg-green-500/10"
                  ])}"${_scopeId2}>${ssrInterpolate(error.value || "✓ Script is valid")}</div><div class="flex gap-2"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UButton, {
                    onClick: handleReset,
                    color: "neutral",
                    variant: "outline",
                    size: "sm"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Load Default `);
                      } else {
                        return [
                          createTextVNode(" Load Default ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    onClick: handleImport,
                    color: "neutral",
                    variant: "outline",
                    size: "sm"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Import `);
                      } else {
                        return [
                          createTextVNode(" Import ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    onClick: handleExport,
                    color: "neutral",
                    variant: "outline",
                    size: "sm"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Export `);
                      } else {
                        return [
                          createTextVNode(" Export ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    onClick: handleSave,
                    disabled: !!error.value || isSaving.value,
                    color: "success",
                    variant: "solid",
                    size: "sm"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(isSaving.value ? "Saving..." : "Save & Close")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(isSaving.value ? "Saving..." : "Save & Close"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><input type="file" accept=".json" class="hidden"${_scopeId2}></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex justify-between items-center gap-3" }, [
                      createVNode("div", {
                        class: [
                          "flex-1 text-sm font-mono p-2 rounded-lg",
                          error.value ? "text-red-500 bg-red-500/10" : "text-green-500 bg-green-500/10"
                        ]
                      }, toDisplayString(error.value || "✓ Script is valid"), 3),
                      createVNode("div", { class: "flex gap-2" }, [
                        createVNode(_component_UButton, {
                          onClick: handleReset,
                          color: "neutral",
                          variant: "outline",
                          size: "sm"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Load Default ")
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UButton, {
                          onClick: handleImport,
                          color: "neutral",
                          variant: "outline",
                          size: "sm"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Import ")
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UButton, {
                          onClick: handleExport,
                          color: "neutral",
                          variant: "outline",
                          size: "sm"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Export ")
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UButton, {
                          onClick: handleSave,
                          disabled: !!error.value || isSaving.value,
                          color: "success",
                          variant: "solid",
                          size: "sm"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(isSaving.value ? "Saving..." : "Save & Close"), 1)
                          ]),
                          _: 1
                        }, 8, ["disabled"])
                      ]),
                      createVNode("input", {
                        ref_key: "fileInputRef",
                        ref: fileInputRef,
                        type: "file",
                        accept: ".json",
                        class: "hidden",
                        onChange: handleFileChange
                      }, null, 544)
                    ])
                  ];
                }
              }),
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex-1 rounded-lg overflow-hidden border border-slate-700"${_scopeId2}></div>`);
                } else {
                  return [
                    createVNode("div", {
                      ref_key: "editorContainer",
                      ref: editorContainer,
                      class: "flex-1 rounded-lg overflow-hidden border border-slate-700"
                    }, null, 512)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UCard, { class: "h-[90vh] flex flex-col" }, {
                header: withCtx(() => [
                  createVNode("div", { class: "flex justify-between items-center" }, [
                    createVNode("div", { class: "flex items-center gap-5" }, [
                      createVNode("h2", { class: "text-xl font-bold text-purple-400" }, " ✏️ Custom Fighter Script Editor "),
                      createVNode("div", { class: "flex gap-1 bg-slate-800 p-1 rounded-lg" }, [
                        createVNode(_component_UButton, {
                          color: activeSlot.value === "slot1" ? "success" : "neutral",
                          variant: activeSlot.value === "slot1" ? "solid" : "outline",
                          size: "xs",
                          onClick: ($event) => switchSlot("slot1")
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Script A ")
                          ]),
                          _: 1
                        }, 8, ["color", "variant", "onClick"]),
                        createVNode(_component_UButton, {
                          color: activeSlot.value === "slot2" ? "success" : "neutral",
                          variant: activeSlot.value === "slot2" ? "solid" : "outline",
                          size: "xs",
                          onClick: ($event) => switchSlot("slot2")
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Script B ")
                          ]),
                          _: 1
                        }, 8, ["color", "variant", "onClick"])
                      ]),
                      createVNode(_component_UBadge, {
                        color: "gray",
                        variant: "subtle",
                        size: "sm"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" JavaScript ")
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode(_component_UButton, {
                      icon: "i-heroicons-x-mark",
                      color: "neutral",
                      variant: "ghost",
                      onClick: onClose
                    })
                  ])
                ]),
                footer: withCtx(() => [
                  createVNode("div", { class: "flex justify-between items-center gap-3" }, [
                    createVNode("div", {
                      class: [
                        "flex-1 text-sm font-mono p-2 rounded-lg",
                        error.value ? "text-red-500 bg-red-500/10" : "text-green-500 bg-green-500/10"
                      ]
                    }, toDisplayString(error.value || "✓ Script is valid"), 3),
                    createVNode("div", { class: "flex gap-2" }, [
                      createVNode(_component_UButton, {
                        onClick: handleReset,
                        color: "neutral",
                        variant: "outline",
                        size: "sm"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Load Default ")
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UButton, {
                        onClick: handleImport,
                        color: "neutral",
                        variant: "outline",
                        size: "sm"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Import ")
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UButton, {
                        onClick: handleExport,
                        color: "neutral",
                        variant: "outline",
                        size: "sm"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Export ")
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UButton, {
                        onClick: handleSave,
                        disabled: !!error.value || isSaving.value,
                        color: "success",
                        variant: "solid",
                        size: "sm"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(isSaving.value ? "Saving..." : "Save & Close"), 1)
                        ]),
                        _: 1
                      }, 8, ["disabled"])
                    ]),
                    createVNode("input", {
                      ref_key: "fileInputRef",
                      ref: fileInputRef,
                      type: "file",
                      accept: ".json",
                      class: "hidden",
                      onChange: handleFileChange
                    }, null, 544)
                  ])
                ]),
                default: withCtx(() => [
                  createVNode("div", {
                    ref_key: "editorContainer",
                    ref: editorContainer,
                    class: "flex-1 rounded-lg overflow-hidden border border-slate-700"
                  }, null, 512)
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ScriptEditor.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$b, { __name: "ScriptEditor" });
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "InfoModal",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const activeTab = ref("MODES");
    const tabs = ["MODES", "CONTROLS", "ABOUT"];
    const tabLabels = {
      MODES: "Game Modes",
      CONTROLS: "Controls",
      ABOUT: "About"
    };
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value)
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UModal = _sfc_main$l;
      const _component_UCard = _sfc_main$k;
      const _component_UButton = _sfc_main$8$1;
      _push(ssrRenderComponent(_component_UModal, mergeProps({
        open: isOpen.value,
        "onUpdate:open": ($event) => isOpen.value = $event,
        ui: { width: "max-w-2xl" }
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) ;
          else {
            return [];
          }
        }),
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UCard, null, {
              header: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex justify-between items-start"${_scopeId2}><h2 class="text-2xl font-bold text-teal-400 tracking-tight"${_scopeId2}>${ssrInterpolate(activeTab.value === "MODES" ? "Single Match vs Evolving" : activeTab.value === "CONTROLS" ? "Command List" : "About NeuroFight")}</h2>`);
                  _push3(ssrRenderComponent(_component_UButton, {
                    icon: "i-heroicons-x-mark",
                    color: "neutral",
                    variant: "ghost",
                    onClick: ($event) => isOpen.value = false
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex justify-between items-start" }, [
                      createVNode("h2", { class: "text-2xl font-bold text-teal-400 tracking-tight" }, toDisplayString(activeTab.value === "MODES" ? "Single Match vs Evolving" : activeTab.value === "CONTROLS" ? "Command List" : "About NeuroFight"), 1),
                      createVNode(_component_UButton, {
                        icon: "i-heroicons-x-mark",
                        color: "neutral",
                        variant: "ghost",
                        onClick: ($event) => isOpen.value = false
                      }, null, 8, ["onClick"])
                    ])
                  ];
                }
              }),
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex flex-col md:flex-row gap-4"${_scopeId2}><div class="bg-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-800 flex flex-row md:flex-col gap-2 md:w-48 overflow-x-auto"${_scopeId2}><!--[-->`);
                  ssrRenderList(tabs, (tab) => {
                    _push3(ssrRenderComponent(_component_UButton, {
                      key: tab,
                      color: activeTab.value === tab ? "success" : "neutral",
                      variant: activeTab.value === tab ? "solid" : "outline",
                      class: "text-left",
                      onClick: ($event) => activeTab.value = tab
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(tabLabels[tab])}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(tabLabels[tab]), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  });
                  _push3(`<!--]--></div><div class="flex-1 p-6 overflow-y-auto bg-slate-900"${_scopeId2}><div class="space-y-4 text-slate-300 leading-relaxed text-sm"${_scopeId2}>`);
                  if (activeTab.value === "MODES") {
                    _push3(`<div class="space-y-6"${_scopeId2}><div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50"${_scopeId2}><h3 class="text-lg font-bold text-white mb-2"${_scopeId2}>Single Match Mode</h3><p${_scopeId2}>Fight against the best trained AI. Perfect for testing your skills!</p></div><div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50"${_scopeId2}><h3 class="text-lg font-bold text-white mb-2"${_scopeId2}>Training Mode</h3><p${_scopeId2}>Watch AI evolve through generations. Population-based genetic algorithm training.</p></div></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (activeTab.value === "CONTROLS") {
                    _push3(`<div class="space-y-4"${_scopeId2}><div${_scopeId2}><h3 class="font-bold text-white mb-2"${_scopeId2}>Keyboard</h3><ul class="list-disc list-inside space-y-1"${_scopeId2}><li${_scopeId2}>WASD / Arrow Keys: Move</li><li${_scopeId2}>J / Space: Punch</li><li${_scopeId2}>K: Kick</li><li${_scopeId2}>L / Shift: Block</li></ul></div><div${_scopeId2}><h3 class="font-bold text-white mb-2"${_scopeId2}>Gamepad</h3><ul class="list-disc list-inside space-y-1"${_scopeId2}><li${_scopeId2}>D-Pad / Left Stick: Move</li><li${_scopeId2}>X / A: Punch</li><li${_scopeId2}>B: Kick</li><li${_scopeId2}>RB / RT: Block</li></ul></div></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (activeTab.value === "ABOUT") {
                    _push3(`<div class="space-y-4"${_scopeId2}><p${_scopeId2}> NeuroEvolution: Stickman Fighters is an experimental game demonstrating neuroevolution and genetic algorithms. AI fighters learn through generations of combat. </p></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex flex-col md:flex-row gap-4" }, [
                      createVNode("div", { class: "bg-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-800 flex flex-row md:flex-col gap-2 md:w-48 overflow-x-auto" }, [
                        (openBlock(), createBlock(Fragment, null, renderList(tabs, (tab) => {
                          return createVNode(_component_UButton, {
                            key: tab,
                            color: activeTab.value === tab ? "success" : "neutral",
                            variant: activeTab.value === tab ? "solid" : "outline",
                            class: "text-left",
                            onClick: ($event) => activeTab.value = tab
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(tabLabels[tab]), 1)
                            ]),
                            _: 2
                          }, 1032, ["color", "variant", "onClick"]);
                        }), 64))
                      ]),
                      createVNode("div", { class: "flex-1 p-6 overflow-y-auto bg-slate-900" }, [
                        createVNode("div", { class: "space-y-4 text-slate-300 leading-relaxed text-sm" }, [
                          activeTab.value === "MODES" ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "space-y-6"
                          }, [
                            createVNode("div", { class: "bg-slate-800/50 p-4 rounded-xl border border-slate-700/50" }, [
                              createVNode("h3", { class: "text-lg font-bold text-white mb-2" }, "Single Match Mode"),
                              createVNode("p", null, "Fight against the best trained AI. Perfect for testing your skills!")
                            ]),
                            createVNode("div", { class: "bg-slate-800/50 p-4 rounded-xl border border-slate-700/50" }, [
                              createVNode("h3", { class: "text-lg font-bold text-white mb-2" }, "Training Mode"),
                              createVNode("p", null, "Watch AI evolve through generations. Population-based genetic algorithm training.")
                            ])
                          ])) : createCommentVNode("", true),
                          activeTab.value === "CONTROLS" ? (openBlock(), createBlock("div", {
                            key: 1,
                            class: "space-y-4"
                          }, [
                            createVNode("div", null, [
                              createVNode("h3", { class: "font-bold text-white mb-2" }, "Keyboard"),
                              createVNode("ul", { class: "list-disc list-inside space-y-1" }, [
                                createVNode("li", null, "WASD / Arrow Keys: Move"),
                                createVNode("li", null, "J / Space: Punch"),
                                createVNode("li", null, "K: Kick"),
                                createVNode("li", null, "L / Shift: Block")
                              ])
                            ]),
                            createVNode("div", null, [
                              createVNode("h3", { class: "font-bold text-white mb-2" }, "Gamepad"),
                              createVNode("ul", { class: "list-disc list-inside space-y-1" }, [
                                createVNode("li", null, "D-Pad / Left Stick: Move"),
                                createVNode("li", null, "X / A: Punch"),
                                createVNode("li", null, "B: Kick"),
                                createVNode("li", null, "RB / RT: Block")
                              ])
                            ])
                          ])) : createCommentVNode("", true),
                          activeTab.value === "ABOUT" ? (openBlock(), createBlock("div", {
                            key: 2,
                            class: "space-y-4"
                          }, [
                            createVNode("p", null, " NeuroEvolution: Stickman Fighters is an experimental game demonstrating neuroevolution and genetic algorithms. AI fighters learn through generations of combat. ")
                          ])) : createCommentVNode("", true)
                        ])
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UCard, null, {
                header: withCtx(() => [
                  createVNode("div", { class: "flex justify-between items-start" }, [
                    createVNode("h2", { class: "text-2xl font-bold text-teal-400 tracking-tight" }, toDisplayString(activeTab.value === "MODES" ? "Single Match vs Evolving" : activeTab.value === "CONTROLS" ? "Command List" : "About NeuroFight"), 1),
                    createVNode(_component_UButton, {
                      icon: "i-heroicons-x-mark",
                      color: "neutral",
                      variant: "ghost",
                      onClick: ($event) => isOpen.value = false
                    }, null, 8, ["onClick"])
                  ])
                ]),
                default: withCtx(() => [
                  createVNode("div", { class: "flex flex-col md:flex-row gap-4" }, [
                    createVNode("div", { class: "bg-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-800 flex flex-row md:flex-col gap-2 md:w-48 overflow-x-auto" }, [
                      (openBlock(), createBlock(Fragment, null, renderList(tabs, (tab) => {
                        return createVNode(_component_UButton, {
                          key: tab,
                          color: activeTab.value === tab ? "success" : "neutral",
                          variant: activeTab.value === tab ? "solid" : "outline",
                          class: "text-left",
                          onClick: ($event) => activeTab.value = tab
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(tabLabels[tab]), 1)
                          ]),
                          _: 2
                        }, 1032, ["color", "variant", "onClick"]);
                      }), 64))
                    ]),
                    createVNode("div", { class: "flex-1 p-6 overflow-y-auto bg-slate-900" }, [
                      createVNode("div", { class: "space-y-4 text-slate-300 leading-relaxed text-sm" }, [
                        activeTab.value === "MODES" ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "space-y-6"
                        }, [
                          createVNode("div", { class: "bg-slate-800/50 p-4 rounded-xl border border-slate-700/50" }, [
                            createVNode("h3", { class: "text-lg font-bold text-white mb-2" }, "Single Match Mode"),
                            createVNode("p", null, "Fight against the best trained AI. Perfect for testing your skills!")
                          ]),
                          createVNode("div", { class: "bg-slate-800/50 p-4 rounded-xl border border-slate-700/50" }, [
                            createVNode("h3", { class: "text-lg font-bold text-white mb-2" }, "Training Mode"),
                            createVNode("p", null, "Watch AI evolve through generations. Population-based genetic algorithm training.")
                          ])
                        ])) : createCommentVNode("", true),
                        activeTab.value === "CONTROLS" ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: "space-y-4"
                        }, [
                          createVNode("div", null, [
                            createVNode("h3", { class: "font-bold text-white mb-2" }, "Keyboard"),
                            createVNode("ul", { class: "list-disc list-inside space-y-1" }, [
                              createVNode("li", null, "WASD / Arrow Keys: Move"),
                              createVNode("li", null, "J / Space: Punch"),
                              createVNode("li", null, "K: Kick"),
                              createVNode("li", null, "L / Shift: Block")
                            ])
                          ]),
                          createVNode("div", null, [
                            createVNode("h3", { class: "font-bold text-white mb-2" }, "Gamepad"),
                            createVNode("ul", { class: "list-disc list-inside space-y-1" }, [
                              createVNode("li", null, "D-Pad / Left Stick: Move"),
                              createVNode("li", null, "X / A: Punch"),
                              createVNode("li", null, "B: Kick"),
                              createVNode("li", null, "RB / RT: Block")
                            ])
                          ])
                        ])) : createCommentVNode("", true),
                        activeTab.value === "ABOUT" ? (openBlock(), createBlock("div", {
                          key: 2,
                          class: "space-y-4"
                        }, [
                          createVNode("p", null, " NeuroEvolution: Stickman Fighters is an experimental game demonstrating neuroevolution and genetic algorithms. AI fighters learn through generations of combat. ")
                        ])) : createCommentVNode("", true)
                      ])
                    ])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/InfoModal.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$a, { __name: "InfoModal" });
const theme$3 = {
  "slots": {
    "root": "relative flex items-start",
    "base": [
      "inline-flex items-center shrink-0 rounded-full border-2 border-transparent focus-visible:outline-2 focus-visible:outline-offset-2 data-[state=unchecked]:bg-accented",
      "transition-[background] duration-200"
    ],
    "container": "flex items-center",
    "thumb": "group pointer-events-none rounded-full bg-default shadow-lg ring-0 transition-transform duration-200 data-[state=unchecked]:translate-x-0 data-[state=unchecked]:rtl:-translate-x-0 flex items-center justify-center",
    "icon": [
      "absolute shrink-0 group-data-[state=unchecked]:text-dimmed opacity-0 size-10/12",
      "transition-[color,opacity] duration-200"
    ],
    "wrapper": "ms-2",
    "label": "block font-medium text-default",
    "description": "text-muted"
  },
  "variants": {
    "color": {
      "primary": {
        "base": "data-[state=checked]:bg-primary focus-visible:outline-primary",
        "icon": "group-data-[state=checked]:text-primary"
      },
      "secondary": {
        "base": "data-[state=checked]:bg-secondary focus-visible:outline-secondary",
        "icon": "group-data-[state=checked]:text-secondary"
      },
      "success": {
        "base": "data-[state=checked]:bg-success focus-visible:outline-success",
        "icon": "group-data-[state=checked]:text-success"
      },
      "info": {
        "base": "data-[state=checked]:bg-info focus-visible:outline-info",
        "icon": "group-data-[state=checked]:text-info"
      },
      "warning": {
        "base": "data-[state=checked]:bg-warning focus-visible:outline-warning",
        "icon": "group-data-[state=checked]:text-warning"
      },
      "error": {
        "base": "data-[state=checked]:bg-error focus-visible:outline-error",
        "icon": "group-data-[state=checked]:text-error"
      },
      "neutral": {
        "base": "data-[state=checked]:bg-inverted focus-visible:outline-inverted",
        "icon": "group-data-[state=checked]:text-highlighted"
      }
    },
    "size": {
      "xs": {
        "base": "w-7",
        "container": "h-4",
        "thumb": "size-3 data-[state=checked]:translate-x-3 data-[state=checked]:rtl:-translate-x-3",
        "wrapper": "text-xs"
      },
      "sm": {
        "base": "w-8",
        "container": "h-4",
        "thumb": "size-3.5 data-[state=checked]:translate-x-3.5 data-[state=checked]:rtl:-translate-x-3.5",
        "wrapper": "text-xs"
      },
      "md": {
        "base": "w-9",
        "container": "h-5",
        "thumb": "size-4 data-[state=checked]:translate-x-4 data-[state=checked]:rtl:-translate-x-4",
        "wrapper": "text-sm"
      },
      "lg": {
        "base": "w-10",
        "container": "h-5",
        "thumb": "size-4.5 data-[state=checked]:translate-x-4.5 data-[state=checked]:rtl:-translate-x-4.5",
        "wrapper": "text-sm"
      },
      "xl": {
        "base": "w-11",
        "container": "h-6",
        "thumb": "size-5 data-[state=checked]:translate-x-5 data-[state=checked]:rtl:-translate-x-5",
        "wrapper": "text-base"
      }
    },
    "checked": {
      "true": {
        "icon": "group-data-[state=checked]:opacity-100"
      }
    },
    "unchecked": {
      "true": {
        "icon": "group-data-[state=unchecked]:opacity-100"
      }
    },
    "loading": {
      "true": {
        "icon": "animate-spin"
      }
    },
    "required": {
      "true": {
        "label": "after:content-['*'] after:ms-0.5 after:text-error"
      }
    },
    "disabled": {
      "true": {
        "root": "opacity-75",
        "base": "cursor-not-allowed",
        "label": "cursor-not-allowed",
        "description": "cursor-not-allowed"
      }
    }
  },
  "defaultVariants": {
    "color": "primary",
    "size": "md"
  }
};
const _sfc_main$9 = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "USwitch",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    as: { type: null, required: false },
    color: { type: null, required: false },
    size: { type: null, required: false },
    loading: { type: Boolean, required: false },
    loadingIcon: { type: null, required: false },
    checkedIcon: { type: null, required: false },
    uncheckedIcon: { type: null, required: false },
    label: { type: String, required: false },
    description: { type: String, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    disabled: { type: Boolean, required: false },
    id: { type: String, required: false },
    name: { type: String, required: false },
    required: { type: Boolean, required: false },
    value: { type: String, required: false },
    defaultValue: { type: Boolean, required: false }
  }, {
    "modelValue": { type: Boolean, ...{ default: void 0 } },
    "modelModifiers": {}
  }),
  emits: /* @__PURE__ */ mergeModels(["change"], ["update:modelValue"]),
  setup(__props, { emit: __emit }) {
    const props = __props;
    const slots = useSlots();
    const emits = __emit;
    const modelValue = useModel(__props, "modelValue", { type: Boolean, ...{ default: void 0 } });
    const appConfig = useAppConfig();
    const rootProps = useForwardProps(reactivePick(props, "required", "value", "defaultValue"));
    const { id: _id, emitFormChange, emitFormInput, size, color, name, disabled, ariaAttrs } = useFormField(props);
    const id = _id.value ?? useId();
    const ui = computed(() => tv({ extend: tv(theme$3), ...appConfig.ui?.switch || {} })({
      size: size.value,
      color: color.value,
      required: props.required,
      loading: props.loading,
      disabled: disabled.value || props.loading
    }));
    function onUpdate(value) {
      const event = new Event("change", { target: { value } });
      emits("change", event);
      emitFormChange();
      emitFormInput();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-slot": "root",
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div data-slot="container" class="${ssrRenderClass(ui.value.container({ class: props.ui?.container }))}"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(SwitchRoot), mergeProps({ id: unref(id) }, { ...unref(rootProps), ..._ctx.$attrs, ...unref(ariaAttrs) }, {
              modelValue: modelValue.value,
              "onUpdate:modelValue": [($event) => modelValue.value = $event, onUpdate],
              name: unref(name),
              disabled: unref(disabled) || __props.loading,
              "data-slot": "base",
              class: ui.value.base({ class: props.ui?.base })
            }), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(SwitchThumb), {
                    "data-slot": "thumb",
                    class: ui.value.thumb({ class: props.ui?.thumb })
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (__props.loading) {
                          _push4(ssrRenderComponent(_sfc_main$d$1, {
                            name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, checked: true, unchecked: true })
                          }, null, _parent4, _scopeId3));
                        } else {
                          _push4(`<!--[-->`);
                          if (__props.checkedIcon) {
                            _push4(ssrRenderComponent(_sfc_main$d$1, {
                              name: __props.checkedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: props.ui?.icon, checked: true })
                            }, null, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          if (__props.uncheckedIcon) {
                            _push4(ssrRenderComponent(_sfc_main$d$1, {
                              name: __props.uncheckedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: props.ui?.icon, unchecked: true })
                            }, null, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`<!--]-->`);
                        }
                      } else {
                        return [
                          __props.loading ? (openBlock(), createBlock(_sfc_main$d$1, {
                            key: 0,
                            name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, checked: true, unchecked: true })
                          }, null, 8, ["name", "class"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                            __props.checkedIcon ? (openBlock(), createBlock(_sfc_main$d$1, {
                              key: 0,
                              name: __props.checkedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: props.ui?.icon, checked: true })
                            }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                            __props.uncheckedIcon ? (openBlock(), createBlock(_sfc_main$d$1, {
                              key: 1,
                              name: __props.uncheckedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: props.ui?.icon, unchecked: true })
                            }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                          ], 64))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(SwitchThumb), {
                      "data-slot": "thumb",
                      class: ui.value.thumb({ class: props.ui?.thumb })
                    }, {
                      default: withCtx(() => [
                        __props.loading ? (openBlock(), createBlock(_sfc_main$d$1, {
                          key: 0,
                          name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                          "data-slot": "icon",
                          class: ui.value.icon({ class: props.ui?.icon, checked: true, unchecked: true })
                        }, null, 8, ["name", "class"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                          __props.checkedIcon ? (openBlock(), createBlock(_sfc_main$d$1, {
                            key: 0,
                            name: __props.checkedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, checked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                          __props.uncheckedIcon ? (openBlock(), createBlock(_sfc_main$d$1, {
                            key: 1,
                            name: __props.uncheckedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, unchecked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                        ], 64))
                      ]),
                      _: 1
                    }, 8, ["class"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (__props.label || !!slots.label || (__props.description || !!slots.description)) {
              _push2(`<div data-slot="wrapper" class="${ssrRenderClass(ui.value.wrapper({ class: props.ui?.wrapper }))}"${_scopeId}>`);
              if (__props.label || !!slots.label) {
                _push2(ssrRenderComponent(unref(Label), {
                  for: unref(id),
                  "data-slot": "label",
                  class: ui.value.label({ class: props.ui?.label })
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      ssrRenderSlot(_ctx.$slots, "label", { label: __props.label }, () => {
                        _push3(`${ssrInterpolate(__props.label)}`);
                      }, _push3, _parent3, _scopeId2);
                    } else {
                      return [
                        renderSlot(_ctx.$slots, "label", { label: __props.label }, () => [
                          createTextVNode(toDisplayString(__props.label), 1)
                        ])
                      ];
                    }
                  }),
                  _: 3
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (__props.description || !!slots.description) {
                _push2(`<p data-slot="description" class="${ssrRenderClass(ui.value.description({ class: props.ui?.description }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "description", { description: __props.description }, () => {
                  _push2(`${ssrInterpolate(__props.description)}`);
                }, _push2, _parent2, _scopeId);
                _push2(`</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", {
                "data-slot": "container",
                class: ui.value.container({ class: props.ui?.container })
              }, [
                createVNode(unref(SwitchRoot), mergeProps({ id: unref(id) }, { ...unref(rootProps), ..._ctx.$attrs, ...unref(ariaAttrs) }, {
                  modelValue: modelValue.value,
                  "onUpdate:modelValue": [($event) => modelValue.value = $event, onUpdate],
                  name: unref(name),
                  disabled: unref(disabled) || __props.loading,
                  "data-slot": "base",
                  class: ui.value.base({ class: props.ui?.base })
                }), {
                  default: withCtx(() => [
                    createVNode(unref(SwitchThumb), {
                      "data-slot": "thumb",
                      class: ui.value.thumb({ class: props.ui?.thumb })
                    }, {
                      default: withCtx(() => [
                        __props.loading ? (openBlock(), createBlock(_sfc_main$d$1, {
                          key: 0,
                          name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                          "data-slot": "icon",
                          class: ui.value.icon({ class: props.ui?.icon, checked: true, unchecked: true })
                        }, null, 8, ["name", "class"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                          __props.checkedIcon ? (openBlock(), createBlock(_sfc_main$d$1, {
                            key: 0,
                            name: __props.checkedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, checked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                          __props.uncheckedIcon ? (openBlock(), createBlock(_sfc_main$d$1, {
                            key: 1,
                            name: __props.uncheckedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: props.ui?.icon, unchecked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                        ], 64))
                      ]),
                      _: 1
                    }, 8, ["class"])
                  ]),
                  _: 1
                }, 16, ["id", "modelValue", "onUpdate:modelValue", "name", "disabled", "class"])
              ], 2),
              __props.label || !!slots.label || (__props.description || !!slots.description) ? (openBlock(), createBlock("div", {
                key: 0,
                "data-slot": "wrapper",
                class: ui.value.wrapper({ class: props.ui?.wrapper })
              }, [
                __props.label || !!slots.label ? (openBlock(), createBlock(unref(Label), {
                  key: 0,
                  for: unref(id),
                  "data-slot": "label",
                  class: ui.value.label({ class: props.ui?.label })
                }, {
                  default: withCtx(() => [
                    renderSlot(_ctx.$slots, "label", { label: __props.label }, () => [
                      createTextVNode(toDisplayString(__props.label), 1)
                    ])
                  ]),
                  _: 3
                }, 8, ["for", "class"])) : createCommentVNode("", true),
                __props.description || !!slots.description ? (openBlock(), createBlock("p", {
                  key: 1,
                  "data-slot": "description",
                  class: ui.value.description({ class: props.ui?.description })
                }, [
                  renderSlot(_ctx.$slots, "description", { description: __props.description }, () => [
                    createTextVNode(toDisplayString(__props.description), 1)
                  ])
                ], 2)) : createCommentVNode("", true)
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+ui@4.3.0_@babel+parser@7.28.5_@floating-ui+dom@1.7.4_@tiptap+extension-drag-handl_3a690419a02858a5ab0e0095ebe0c427/node_modules/@nuxt/ui/dist/runtime/components/Switch.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "MatchConfiguration",
  __ssrInlineRender: true,
  props: {
    settings: {},
    setSettings: { type: Function },
    gameState: {},
    onOpenScriptEditor: { type: Function },
    onOpenInfo: { type: Function }
  },
  setup(__props) {
    const props = __props;
    const isTrainingActive = computed(() => props.settings.gameMode === "TRAINING");
    const isMatchRunning = computed(() => isTrainingActive.value && props.settings.isRunning);
    const player1Types = ["HUMAN", "AI", "CUSTOM_A", "CUSTOM_B"];
    const player2Types = ["AI", "CUSTOM_A", "CUSTOM_B"];
    const hasCustomScript = computed(() => {
      return props.settings.player1Type.includes("CUSTOM") || props.settings.player2Type.includes("CUSTOM") || props.settings.opponentType.includes("CUSTOM");
    });
    const toggleTrainingMode = () => {
      const newMode = props.settings.gameMode === "ARCADE" ? "TRAINING" : "ARCADE";
      props.setSettings((prev) => ({
        ...prev,
        gameMode: newMode,
        isRunning: false,
        ...newMode === "TRAINING" && {
          player1Type: prev.player1Type || "AI",
          player2Type: "AI"
        }
      }));
    };
    const setPlayer1Type = (type) => {
      props.setSettings((s) => ({
        ...s,
        player1Type: type,
        ...type === "HUMAN" && { simulationSpeed: 1 }
      }));
    };
    const setPlayer2Type = (type) => {
      props.setSettings((s) => ({ ...s, player2Type: type }));
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8$1;
      const _component_USwitch = _sfc_main$9;
      const _component_UIcon = _sfc_main$d$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><div class="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-700/50"><div class="flex items-center gap-2"><h2 class="text-xs font-bold text-slate-300 uppercase tracking-widest pl-2"> Match Setup </h2>`);
      _push(ssrRenderComponent(_component_UButton, {
        size: "xs",
        color: "neutral",
        variant: "ghost",
        onClick: __props.onOpenInfo,
        title: "Game Info & Help"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` i `);
          } else {
            return [
              createTextVNode(" i ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex items-center gap-2"><span class="${ssrRenderClass(["text-[10px] font-bold", isTrainingActive.value ? "text-success" : "text-muted"])}">${ssrInterpolate(isTrainingActive.value ? "TRAINING" : "SINGLE MATCH")}</span>`);
      _push(ssrRenderComponent(_component_USwitch, {
        "model-value": isTrainingActive.value,
        "onUpdate:modelValue": toggleTrainingMode,
        color: "success"
      }, null, _parent));
      _push(`</div></div><div class="${ssrRenderClass(["grid gap-4", isTrainingActive.value ? "grid-cols-1" : "grid-cols-2"])}"><div class="space-y-1"><h2 class="text-[10px] font-bold text-red-400 uppercase tracking-widest flex justify-between"><span>Player 1 (Left)</span>`);
      if (__props.settings.player1Type !== "HUMAN") {
        _push(`<span class="text-[8px] bg-red-900/50 px-1 rounded text-red-200">AUTO</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</h2><div class="${ssrRenderClass(["flex flex-col gap-1 p-1 rounded-lg", isMatchRunning.value ? "bg-slate-900/50 opacity-50" : "bg-slate-900"])}"><!--[-->`);
      ssrRenderList(player1Types, (type) => {
        _push(ssrRenderComponent(_component_UButton, {
          key: type,
          color: __props.settings.player1Type === type ? "success" : "neutral",
          variant: __props.settings.player1Type === type ? "solid" : "outline",
          size: "xs",
          disabled: isMatchRunning.value,
          onClick: ($event) => !isMatchRunning.value && setPlayer1Type(type),
          class: "text-[10px] font-bold"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(type === "CUSTOM_A" ? "SCRIPT A" : type === "CUSTOM_B" ? "SCRIPT B" : type)}`);
            } else {
              return [
                createTextVNode(toDisplayString(type === "CUSTOM_A" ? "SCRIPT A" : type === "CUSTOM_B" ? "SCRIPT B" : type), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></div>`);
      if (!isTrainingActive.value) {
        _push(`<div class="space-y-1"><h2 class="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex justify-between"><span>Player 2 (Right)</span><span class="text-[8px] bg-blue-900/50 px-1 rounded text-blue-200">AUTO</span></h2><div class="flex flex-col gap-1 bg-slate-900 p-1 rounded-lg"><!--[-->`);
        ssrRenderList(player2Types, (type) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: type,
            color: __props.settings.player2Type === type ? "success" : "neutral",
            variant: __props.settings.player2Type === type ? "solid" : "outline",
            size: "xs",
            onClick: ($event) => setPlayer2Type(type),
            class: "text-[10px] font-bold"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(type === "CUSTOM_A" ? "SCRIPT A" : type === "CUSTOM_B" ? "SCRIPT B" : type)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(type === "CUSTOM_A" ? "SCRIPT A" : type === "CUSTOM_B" ? "SCRIPT B" : type), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isTrainingActive.value) {
        _push(`<div class="space-y-1"><h2 class="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex justify-between"><span>Player 2 (Right)</span><span class="text-[8px] bg-blue-900/50 px-1 rounded text-blue-200">AI</span></h2><div class="flex flex-col gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-700"><div class="py-1.5 rounded-md text-[10px] font-bold text-slate-500 text-center"> Always AI (Training) </div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (hasCustomScript.value) {
        _push(ssrRenderComponent(_component_UButton, {
          onClick: __props.onOpenScriptEditor,
          color: "neutral",
          variant: "outline",
          class: "w-full",
          size: "sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-heroicons-pencil-square",
                class: "w-4 h-4"
              }, null, _parent2, _scopeId));
              _push2(` Open Script Editor `);
            } else {
              return [
                createVNode(_component_UIcon, {
                  name: "i-heroicons-pencil-square",
                  class: "w-4 h-4"
                }),
                createTextVNode(" Open Script Editor ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MatchConfiguration.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$8, { __name: "MatchConfiguration" });
const kbdKeysMap = {
  meta: "",
  ctrl: "",
  alt: "",
  win: "⊞",
  command: "⌘",
  shift: "⇧",
  control: "⌃",
  option: "⌥",
  enter: "↵",
  delete: "⌦",
  backspace: "⌫",
  escape: "Esc",
  tab: "⇥",
  capslock: "⇪",
  arrowup: "↑",
  arrowright: "→",
  arrowdown: "↓",
  arrowleft: "←",
  pageup: "⇞",
  pagedown: "⇟",
  home: "↖",
  end: "↘"
};
const _useKbd = () => {
  const macOS = computed(() => false);
  const kbdKeysSpecificMap = reactive({
    meta: " ",
    alt: " ",
    ctrl: " "
  });
  function getKbdKey(value) {
    if (!value) {
      return;
    }
    if (["meta", "alt", "ctrl"].includes(value)) {
      return kbdKeysSpecificMap[value];
    }
    return kbdKeysMap[value] || value;
  }
  return {
    macOS,
    getKbdKey
  };
};
const useKbd = /* @__PURE__ */ createSharedComposable(_useKbd);
const theme$2 = {
  "base": "inline-flex items-center justify-center px-1 rounded-sm font-medium font-sans uppercase",
  "variants": {
    "color": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "variant": {
      "solid": "",
      "outline": "",
      "soft": "",
      "subtle": ""
    },
    "size": {
      "sm": "h-4 min-w-[16px] text-[10px]",
      "md": "h-5 min-w-[20px] text-[11px]",
      "lg": "h-6 min-w-[24px] text-[12px]"
    }
  },
  "compoundVariants": [
    {
      "color": "primary",
      "variant": "solid",
      "class": "text-inverted bg-primary"
    },
    {
      "color": "secondary",
      "variant": "solid",
      "class": "text-inverted bg-secondary"
    },
    {
      "color": "success",
      "variant": "solid",
      "class": "text-inverted bg-success"
    },
    {
      "color": "info",
      "variant": "solid",
      "class": "text-inverted bg-info"
    },
    {
      "color": "warning",
      "variant": "solid",
      "class": "text-inverted bg-warning"
    },
    {
      "color": "error",
      "variant": "solid",
      "class": "text-inverted bg-error"
    },
    {
      "color": "primary",
      "variant": "outline",
      "class": "ring ring-inset ring-primary/50 text-primary"
    },
    {
      "color": "secondary",
      "variant": "outline",
      "class": "ring ring-inset ring-secondary/50 text-secondary"
    },
    {
      "color": "success",
      "variant": "outline",
      "class": "ring ring-inset ring-success/50 text-success"
    },
    {
      "color": "info",
      "variant": "outline",
      "class": "ring ring-inset ring-info/50 text-info"
    },
    {
      "color": "warning",
      "variant": "outline",
      "class": "ring ring-inset ring-warning/50 text-warning"
    },
    {
      "color": "error",
      "variant": "outline",
      "class": "ring ring-inset ring-error/50 text-error"
    },
    {
      "color": "primary",
      "variant": "soft",
      "class": "text-primary bg-primary/10"
    },
    {
      "color": "secondary",
      "variant": "soft",
      "class": "text-secondary bg-secondary/10"
    },
    {
      "color": "success",
      "variant": "soft",
      "class": "text-success bg-success/10"
    },
    {
      "color": "info",
      "variant": "soft",
      "class": "text-info bg-info/10"
    },
    {
      "color": "warning",
      "variant": "soft",
      "class": "text-warning bg-warning/10"
    },
    {
      "color": "error",
      "variant": "soft",
      "class": "text-error bg-error/10"
    },
    {
      "color": "primary",
      "variant": "subtle",
      "class": "text-primary ring ring-inset ring-primary/25 bg-primary/10"
    },
    {
      "color": "secondary",
      "variant": "subtle",
      "class": "text-secondary ring ring-inset ring-secondary/25 bg-secondary/10"
    },
    {
      "color": "success",
      "variant": "subtle",
      "class": "text-success ring ring-inset ring-success/25 bg-success/10"
    },
    {
      "color": "info",
      "variant": "subtle",
      "class": "text-info ring ring-inset ring-info/25 bg-info/10"
    },
    {
      "color": "warning",
      "variant": "subtle",
      "class": "text-warning ring ring-inset ring-warning/25 bg-warning/10"
    },
    {
      "color": "error",
      "variant": "subtle",
      "class": "text-error ring ring-inset ring-error/25 bg-error/10"
    },
    {
      "color": "neutral",
      "variant": "solid",
      "class": "text-inverted bg-inverted"
    },
    {
      "color": "neutral",
      "variant": "outline",
      "class": "ring ring-inset ring-accented text-default bg-default"
    },
    {
      "color": "neutral",
      "variant": "soft",
      "class": "text-default bg-elevated"
    },
    {
      "color": "neutral",
      "variant": "subtle",
      "class": "ring ring-inset ring-accented text-default bg-elevated"
    }
  ],
  "defaultVariants": {
    "variant": "outline",
    "color": "neutral",
    "size": "md"
  }
};
const _sfc_main$7 = {
  __name: "UKbd",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false, default: "kbd" },
    value: { type: null, required: false },
    color: { type: null, required: false },
    variant: { type: null, required: false },
    size: { type: null, required: false },
    class: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const { getKbdKey } = useKbd();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme$2), ...appConfig.ui?.kbd || {} }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        class: ui.value({ class: props.class, color: props.color, variant: props.variant, size: props.size })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, () => {
              _push2(`${ssrInterpolate(unref(getKbdKey)(__props.value))}`);
            }, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default", {}, () => [
                createTextVNode(toDisplayString(unref(getKbdKey)(__props.value)), 1)
              ])
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+ui@4.3.0_@babel+parser@7.28.5_@floating-ui+dom@1.7.4_@tiptap+extension-drag-handl_3a690419a02858a5ab0e0095ebe0c427/node_modules/@nuxt/ui/dist/runtime/components/Kbd.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const theme$1 = {
  "slots": {
    "content": "flex items-center gap-1 bg-default text-highlighted shadow-sm rounded-sm ring ring-default h-6 px-2.5 py-1 text-xs select-none data-[state=delayed-open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-tooltip-content-transform-origin) pointer-events-auto",
    "arrow": "fill-default",
    "text": "truncate",
    "kbds": "hidden lg:inline-flex items-center shrink-0 gap-0.5 not-first-of-type:before:content-['·'] not-first-of-type:before:me-0.5",
    "kbdsSize": "sm"
  }
};
const _sfc_main$6 = {
  __name: "UTooltip",
  __ssrInlineRender: true,
  props: {
    text: { type: String, required: false },
    kbds: { type: Array, required: false },
    content: { type: Object, required: false },
    arrow: { type: [Boolean, Object], required: false },
    portal: { type: [Boolean, String], required: false, skipCheck: true, default: true },
    reference: { type: null, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    defaultOpen: { type: Boolean, required: false },
    open: { type: Boolean, required: false },
    delayDuration: { type: Number, required: false },
    disableHoverableContent: { type: Boolean, required: false },
    disableClosingTrigger: { type: Boolean, required: false },
    disabled: { type: Boolean, required: false },
    ignoreNonKeyboardFocus: { type: Boolean, required: false }
  },
  emits: ["update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const rootProps = useForwardPropsEmits(reactivePick(props, "defaultOpen", "open", "delayDuration", "disableHoverableContent", "disableClosingTrigger", "ignoreNonKeyboardFocus"), emits);
    const portalProps = usePortal(toRef(() => props.portal));
    const contentProps = toRef(() => defu(props.content, { side: "bottom", sideOffset: 8, collisionPadding: 8 }));
    const arrowProps = toRef(() => props.arrow);
    const ui = computed(() => tv({ extend: tv(theme$1), ...appConfig.ui?.tooltip || {} })({
      side: contentProps.value.side
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TooltipRoot), mergeProps(unref(rootProps), {
        disabled: !(__props.text || __props.kbds?.length || !!slots.content) || props.disabled
      }, _attrs), {
        default: withCtx(({ open }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!!slots.default || !!__props.reference) {
              _push2(ssrRenderComponent(unref(TooltipTrigger), mergeProps(_ctx.$attrs, {
                "as-child": "",
                reference: __props.reference,
                class: props.class
              }), {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "default", { open }, null, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "default", { open })
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(unref(TooltipPortal), unref(portalProps), {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(TooltipContent), mergeProps(contentProps.value, {
                    "data-slot": "content",
                    class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                  }), {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        ssrRenderSlot(_ctx.$slots, "content", { ui: ui.value }, () => {
                          if (__props.text) {
                            _push4(`<span data-slot="text" class="${ssrRenderClass(ui.value.text({ class: props.ui?.text }))}"${_scopeId3}>${ssrInterpolate(__props.text)}</span>`);
                          } else {
                            _push4(`<!---->`);
                          }
                          if (__props.kbds?.length) {
                            _push4(`<span data-slot="kbds" class="${ssrRenderClass(ui.value.kbds({ class: props.ui?.kbds }))}"${_scopeId3}><!--[-->`);
                            ssrRenderList(__props.kbds, (kbd, index) => {
                              _push4(ssrRenderComponent(_sfc_main$7, mergeProps({
                                key: index,
                                size: props.ui?.kbdsSize || ui.value.kbdsSize()
                              }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, _parent4, _scopeId3));
                            });
                            _push4(`<!--]--></span>`);
                          } else {
                            _push4(`<!---->`);
                          }
                        }, _push4, _parent4, _scopeId3);
                        if (!!__props.arrow) {
                          _push4(ssrRenderComponent(unref(TooltipArrow), mergeProps(arrowProps.value, {
                            "data-slot": "arrow",
                            class: ui.value.arrow({ class: props.ui?.arrow })
                          }), null, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          renderSlot(_ctx.$slots, "content", { ui: ui.value }, () => [
                            __props.text ? (openBlock(), createBlock("span", {
                              key: 0,
                              "data-slot": "text",
                              class: ui.value.text({ class: props.ui?.text })
                            }, toDisplayString(__props.text), 3)) : createCommentVNode("", true),
                            __props.kbds?.length ? (openBlock(), createBlock("span", {
                              key: 1,
                              "data-slot": "kbds",
                              class: ui.value.kbds({ class: props.ui?.kbds })
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(__props.kbds, (kbd, index) => {
                                return openBlock(), createBlock(_sfc_main$7, mergeProps({
                                  key: index,
                                  size: props.ui?.kbdsSize || ui.value.kbdsSize()
                                }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                              }), 128))
                            ], 2)) : createCommentVNode("", true)
                          ]),
                          !!__props.arrow ? (openBlock(), createBlock(unref(TooltipArrow), mergeProps({ key: 0 }, arrowProps.value, {
                            "data-slot": "arrow",
                            class: ui.value.arrow({ class: props.ui?.arrow })
                          }), null, 16, ["class"])) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(TooltipContent), mergeProps(contentProps.value, {
                      "data-slot": "content",
                      class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                    }), {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, "content", { ui: ui.value }, () => [
                          __props.text ? (openBlock(), createBlock("span", {
                            key: 0,
                            "data-slot": "text",
                            class: ui.value.text({ class: props.ui?.text })
                          }, toDisplayString(__props.text), 3)) : createCommentVNode("", true),
                          __props.kbds?.length ? (openBlock(), createBlock("span", {
                            key: 1,
                            "data-slot": "kbds",
                            class: ui.value.kbds({ class: props.ui?.kbds })
                          }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(__props.kbds, (kbd, index) => {
                              return openBlock(), createBlock(_sfc_main$7, mergeProps({
                                key: index,
                                size: props.ui?.kbdsSize || ui.value.kbdsSize()
                              }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                            }), 128))
                          ], 2)) : createCommentVNode("", true)
                        ]),
                        !!__props.arrow ? (openBlock(), createBlock(unref(TooltipArrow), mergeProps({ key: 0 }, arrowProps.value, {
                          "data-slot": "arrow",
                          class: ui.value.arrow({ class: props.ui?.arrow })
                        }), null, 16, ["class"])) : createCommentVNode("", true)
                      ]),
                      _: 3
                    }, 16, ["class"])
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          } else {
            return [
              !!slots.default || !!__props.reference ? (openBlock(), createBlock(unref(TooltipTrigger), mergeProps({ key: 0 }, _ctx.$attrs, {
                "as-child": "",
                reference: __props.reference,
                class: props.class
              }), {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default", { open })
                ]),
                _: 2
              }, 1040, ["reference", "class"])) : createCommentVNode("", true),
              createVNode(unref(TooltipPortal), unref(portalProps), {
                default: withCtx(() => [
                  createVNode(unref(TooltipContent), mergeProps(contentProps.value, {
                    "data-slot": "content",
                    class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                  }), {
                    default: withCtx(() => [
                      renderSlot(_ctx.$slots, "content", { ui: ui.value }, () => [
                        __props.text ? (openBlock(), createBlock("span", {
                          key: 0,
                          "data-slot": "text",
                          class: ui.value.text({ class: props.ui?.text })
                        }, toDisplayString(__props.text), 3)) : createCommentVNode("", true),
                        __props.kbds?.length ? (openBlock(), createBlock("span", {
                          key: 1,
                          "data-slot": "kbds",
                          class: ui.value.kbds({ class: props.ui?.kbds })
                        }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(__props.kbds, (kbd, index) => {
                            return openBlock(), createBlock(_sfc_main$7, mergeProps({
                              key: index,
                              size: props.ui?.kbdsSize || ui.value.kbdsSize()
                            }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                          }), 128))
                        ], 2)) : createCommentVNode("", true)
                      ]),
                      !!__props.arrow ? (openBlock(), createBlock(unref(TooltipArrow), mergeProps({ key: 0 }, arrowProps.value, {
                        "data-slot": "arrow",
                        class: ui.value.arrow({ class: props.ui?.arrow })
                      }), null, 16, ["class"])) : createCommentVNode("", true)
                    ]),
                    _: 3
                  }, 16, ["class"])
                ]),
                _: 3
              }, 16)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+ui@4.3.0_@babel+parser@7.28.5_@floating-ui+dom@1.7.4_@tiptap+extension-drag-handl_3a690419a02858a5ab0e0095ebe0c427/node_modules/@nuxt/ui/dist/runtime/components/Tooltip.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const theme = {
  "slots": {
    "root": "relative flex items-center select-none touch-none",
    "track": "relative bg-accented overflow-hidden rounded-full grow",
    "range": "absolute rounded-full",
    "thumb": "rounded-full bg-default ring-2 focus-visible:outline-2 focus-visible:outline-offset-2"
  },
  "variants": {
    "color": {
      "primary": {
        "range": "bg-primary",
        "thumb": "ring-primary focus-visible:outline-primary/50"
      },
      "secondary": {
        "range": "bg-secondary",
        "thumb": "ring-secondary focus-visible:outline-secondary/50"
      },
      "success": {
        "range": "bg-success",
        "thumb": "ring-success focus-visible:outline-success/50"
      },
      "info": {
        "range": "bg-info",
        "thumb": "ring-info focus-visible:outline-info/50"
      },
      "warning": {
        "range": "bg-warning",
        "thumb": "ring-warning focus-visible:outline-warning/50"
      },
      "error": {
        "range": "bg-error",
        "thumb": "ring-error focus-visible:outline-error/50"
      },
      "neutral": {
        "range": "bg-inverted",
        "thumb": "ring-inverted focus-visible:outline-inverted/50"
      }
    },
    "size": {
      "xs": {
        "thumb": "size-3"
      },
      "sm": {
        "thumb": "size-3.5"
      },
      "md": {
        "thumb": "size-4"
      },
      "lg": {
        "thumb": "size-4.5"
      },
      "xl": {
        "thumb": "size-5"
      }
    },
    "orientation": {
      "horizontal": {
        "root": "w-full",
        "range": "h-full"
      },
      "vertical": {
        "root": "flex-col h-full",
        "range": "w-full"
      }
    },
    "disabled": {
      "true": {
        "root": "opacity-75 cursor-not-allowed"
      }
    }
  },
  "compoundVariants": [
    {
      "orientation": "horizontal",
      "size": "xs",
      "class": {
        "track": "h-[6px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "sm",
      "class": {
        "track": "h-[7px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "md",
      "class": {
        "track": "h-[8px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "lg",
      "class": {
        "track": "h-[9px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "xl",
      "class": {
        "track": "h-[10px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xs",
      "class": {
        "track": "w-[6px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "sm",
      "class": {
        "track": "w-[7px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "md",
      "class": {
        "track": "w-[8px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "lg",
      "class": {
        "track": "w-[9px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xl",
      "class": {
        "track": "w-[10px]"
      }
    }
  ],
  "defaultVariants": {
    "size": "md",
    "color": "primary"
  }
};
const _sfc_main$5 = {
  __name: "USlider",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    as: { type: null, required: false },
    size: { type: null, required: false },
    color: { type: null, required: false },
    orientation: { type: null, required: false, default: "horizontal" },
    tooltip: { type: [Boolean, Object], required: false },
    defaultValue: { type: [Number, Array], required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    name: { type: String, required: false },
    disabled: { type: Boolean, required: false },
    inverted: { type: Boolean, required: false },
    min: { type: Number, required: false, default: 0 },
    max: { type: Number, required: false, default: 100 },
    step: { type: Number, required: false, default: 1 },
    minStepsBetweenThumbs: { type: Number, required: false }
  }, {
    "modelValue": { type: null },
    "modelModifiers": {}
  }),
  emits: /* @__PURE__ */ mergeModels(["change"], ["update:modelValue"]),
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const modelValue = useModel(__props, "modelValue");
    const appConfig = useAppConfig();
    const rootProps = useForwardPropsEmits(reactivePick(props, "as", "orientation", "min", "max", "step", "minStepsBetweenThumbs", "inverted"), emits);
    const { id, emitFormChange, emitFormInput, size, color, name, disabled, ariaAttrs } = useFormField(props);
    const defaultSliderValue = computed(() => {
      if (typeof props.defaultValue === "number") {
        return [props.defaultValue];
      }
      return props.defaultValue;
    });
    const sliderValue = computed({
      get() {
        if (typeof modelValue.value === "number") {
          return [modelValue.value];
        }
        return modelValue.value ?? defaultSliderValue.value;
      },
      set(value) {
        modelValue.value = value?.length !== 1 ? value : value[0];
      }
    });
    const thumbs = computed(() => sliderValue.value?.length ?? 1);
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.slider || {} })({
      disabled: disabled.value,
      size: size.value,
      color: color.value,
      orientation: props.orientation
    }));
    function onChange(value) {
      const event = new Event("change", { target: { value } });
      emits("change", event);
      emitFormChange();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(SliderRoot), mergeProps({ ...unref(rootProps), ...unref(ariaAttrs) }, {
        id: unref(id),
        modelValue: sliderValue.value,
        "onUpdate:modelValue": [($event) => sliderValue.value = $event, ($event) => unref(emitFormInput)()],
        name: unref(name),
        disabled: unref(disabled),
        "data-slot": "root",
        class: ui.value.root({ class: [props.ui?.root, props.class] }),
        "default-value": defaultSliderValue.value,
        onValueCommit: onChange
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(SliderTrack), {
              "data-slot": "track",
              class: ui.value.track({ class: props.ui?.track })
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(SliderRange), {
                    "data-slot": "range",
                    class: ui.value.range({ class: props.ui?.range })
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(SliderRange), {
                      "data-slot": "range",
                      class: ui.value.range({ class: props.ui?.range })
                    }, null, 8, ["class"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<!--[-->`);
            ssrRenderList(thumbs.value, (thumb) => {
              _push2(`<!--[-->`);
              if (!!__props.tooltip) {
                _push2(ssrRenderComponent(_sfc_main$6, mergeProps({
                  text: thumbs.value > 1 ? String(sliderValue.value?.[thumb - 1]) : String(sliderValue.value),
                  "disable-closing-trigger": ""
                }, { ref_for: true }, typeof __props.tooltip === "object" ? __props.tooltip : {}), {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(unref(SliderThumb), {
                        "data-slot": "thumb",
                        class: ui.value.thumb({ class: props.ui?.thumb }),
                        "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(unref(SliderThumb), {
                          "data-slot": "thumb",
                          class: ui.value.thumb({ class: props.ui?.thumb }),
                          "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                        }, null, 8, ["class", "aria-label"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(unref(SliderThumb), {
                  "data-slot": "thumb",
                  class: ui.value.thumb({ class: props.ui?.thumb }),
                  "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                }, null, _parent2, _scopeId));
              }
              _push2(`<!--]-->`);
            });
            _push2(`<!--]-->`);
          } else {
            return [
              createVNode(unref(SliderTrack), {
                "data-slot": "track",
                class: ui.value.track({ class: props.ui?.track })
              }, {
                default: withCtx(() => [
                  createVNode(unref(SliderRange), {
                    "data-slot": "range",
                    class: ui.value.range({ class: props.ui?.range })
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class"]),
              (openBlock(true), createBlock(Fragment, null, renderList(thumbs.value, (thumb) => {
                return openBlock(), createBlock(Fragment, { key: thumb }, [
                  !!__props.tooltip ? (openBlock(), createBlock(_sfc_main$6, mergeProps({
                    key: 0,
                    text: thumbs.value > 1 ? String(sliderValue.value?.[thumb - 1]) : String(sliderValue.value),
                    "disable-closing-trigger": ""
                  }, { ref_for: true }, typeof __props.tooltip === "object" ? __props.tooltip : {}), {
                    default: withCtx(() => [
                      createVNode(unref(SliderThumb), {
                        "data-slot": "thumb",
                        class: ui.value.thumb({ class: props.ui?.thumb }),
                        "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                      }, null, 8, ["class", "aria-label"])
                    ]),
                    _: 2
                  }, 1040, ["text"])) : (openBlock(), createBlock(unref(SliderThumb), {
                    key: 1,
                    "data-slot": "thumb",
                    class: ui.value.thumb({ class: props.ui?.thumb }),
                    "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                  }, null, 8, ["class", "aria-label"]))
                ], 64);
              }), 128))
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+ui@4.3.0_@babel+parser@7.28.5_@floating-ui+dom@1.7.4_@tiptap+extension-drag-handl_3a690419a02858a5ab0e0095ebe0c427/node_modules/@nuxt/ui/dist/runtime/components/Slider.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "TrainingParameters",
  __ssrInlineRender: true,
  props: {
    settings: {},
    setSettings: { type: Function },
    bestFitness: {},
    gameState: {}
  },
  emits: ["export-weights", "import-weights", "reset-genome"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const props = __props;
    const showTrainingParams = ref(true);
    const isTrainingActive = computed(() => props.settings.gameMode === "TRAINING");
    const isHumanOpponent = computed(() => props.settings.player1Type === "HUMAN");
    const shouldDisableSpeed = computed(() => isHumanOpponent.value);
    watch(isHumanOpponent, (isHuman) => {
      if (isHuman && props.settings.simulationSpeed !== 1) {
        props.setSettings((prev) => ({ ...prev, simulationSpeed: 1 }));
      }
    });
    const updateSpeed = (value) => {
      if (value !== void 0 && !isHumanOpponent.value) {
        props.setSettings({ ...props.settings, simulationSpeed: value });
      }
    };
    const updateMutationRate = (value) => {
      if (value !== void 0) {
        props.setSettings({ ...props.settings, mutationRate: value / 100 });
      }
    };
    const toggleBackgroundTraining = () => {
      props.setSettings((s) => ({ ...s, backgroundTraining: !s.backgroundTraining }));
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8$1;
      const _component_UIcon = _sfc_main$d$1;
      const _component_USlider = _sfc_main$5;
      const _component_USwitch = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "border-t border-slate-700 pt-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UButton, {
        onClick: ($event) => showTrainingParams.value = !showTrainingParams.value,
        color: "neutral",
        variant: "ghost",
        class: "flex items-center justify-between w-full text-xs font-bold uppercase tracking-widest mb-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>Training Parameters</span>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: showTrainingParams.value ? "i-heroicons-chevron-up" : "i-heroicons-chevron-down",
              class: "w-4 h-4"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("span", null, "Training Parameters"),
              createVNode(_component_UIcon, {
                name: showTrainingParams.value ? "i-heroicons-chevron-up" : "i-heroicons-chevron-down",
                class: "w-4 h-4"
              }, null, 8, ["name"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="${ssrRenderClass(["space-y-4 transition-all duration-300 overflow-hidden", showTrainingParams.value ? "max-h-96 opacity-100" : "max-h-0 opacity-0"])}"><div class="space-y-2"><div class="flex justify-between"><label class="text-xs font-semibold text-slate-300">Simulation Speed</label><span class="text-xs font-mono text-teal-400">${ssrInterpolate(isHumanOpponent.value ? "1x" : `${__props.settings.simulationSpeed}x`)}</span></div>`);
      _push(ssrRenderComponent(_component_USlider, {
        "model-value": isHumanOpponent.value ? 1 : __props.settings.simulationSpeed,
        min: 1,
        max: 5e3,
        disabled: shouldDisableSpeed.value,
        "onUpdate:modelValue": updateSpeed
      }, null, _parent));
      if (isHumanOpponent.value) {
        _push(`<p class="text-[10px] text-slate-500 italic"> Speed locked to 1x for Human opponent </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-2"><div class="flex justify-between"><label class="text-xs font-semibold text-slate-300">Mutation Rate</label><span class="text-xs font-mono text-purple-400">${ssrInterpolate((__props.settings.mutationRate * 100).toFixed(0))}%</span></div>`);
      _push(ssrRenderComponent(_component_USlider, {
        "model-value": __props.settings.mutationRate * 100,
        min: 1,
        max: 100,
        "onUpdate:modelValue": updateMutationRate
      }, null, _parent));
      _push(`</div>`);
      if (!isTrainingActive.value) {
        _push(`<div class="pt-2"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-xs font-semibold text-slate-300">Background Training</span>`);
        if (__props.settings.backgroundTraining) {
          _push(`<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Training active in background"></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        _push(ssrRenderComponent(_component_USwitch, {
          "model-value": __props.settings.backgroundTraining,
          "onUpdate:modelValue": toggleBackgroundTraining,
          color: "success"
        }, null, _parent));
        _push(`</div><p class="text-[10px] text-slate-500 mt-1"> AI keeps learning while you play Single Matches </p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-2 gap-2 pt-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        onClick: ($event) => emit("export-weights"),
        disabled: __props.bestFitness === 0,
        color: "neutral",
        variant: "outline",
        size: "sm",
        class: "flex items-center justify-center gap-1.5"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-heroicons-arrow-down-tray",
              class: "w-3 h-3"
            }, null, _parent2, _scopeId));
            _push2(` EXPORT `);
          } else {
            return [
              createVNode(_component_UIcon, {
                name: "i-heroicons-arrow-down-tray",
                class: "w-3 h-3"
              }),
              createTextVNode(" EXPORT ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        onClick: ($event) => emit("import-weights"),
        color: "neutral",
        variant: "outline",
        size: "sm",
        class: "flex items-center justify-center gap-1.5"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-heroicons-arrow-up-tray",
              class: "w-3 h-3"
            }, null, _parent2, _scopeId));
            _push2(` IMPORT `);
          } else {
            return [
              createVNode(_component_UIcon, {
                name: "i-heroicons-arrow-up-tray",
                class: "w-3 h-3"
              }),
              createTextVNode(" IMPORT ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="pt-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        onClick: ($event) => emit("reset-genome"),
        color: "error",
        variant: "solid",
        class: "w-full",
        size: "sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-heroicons-trash",
              class: "w-3 h-3"
            }, null, _parent2, _scopeId));
            _push2(` RESET GENOME `);
          } else {
            return [
              createVNode(_component_UIcon, {
                name: "i-heroicons-trash",
                class: "w-3 h-3"
              }),
              createTextVNode(" RESET GENOME ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TrainingParameters.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_6$1 = Object.assign(_sfc_main$4, { __name: "TrainingParameters" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "FitnessChart",
  __ssrInlineRender: true,
  props: {
    fitnessHistory: {},
    currentGen: {},
    bestFitness: {},
    isTrainingActive: { type: Boolean }
  },
  setup(__props) {
    use([
      CanvasRenderer,
      LineChart,
      TitleComponent,
      TooltipComponent,
      GridComponent
    ]);
    const props = __props;
    const chartOption = computed(() => ({
      xAxis: {
        type: "category",
        data: props.fitnessHistory.map((d) => d.gen),
        show: false
      },
      yAxis: {
        type: "value",
        show: false
      },
      tooltip: {
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        textStyle: { color: "#fff", fontSize: 10 },
        formatter: (params) => {
          return `Gen ${params.data[0]}: ${params.data[1].toFixed(0)}`;
        }
      },
      series: [{
        data: props.fitnessHistory.map((d) => [d.gen, d.fitness]),
        type: "line",
        smooth: true,
        lineStyle: { color: "#2dd4bf", width: 2 },
        symbol: "none",
        animationDuration: 300
      }],
      grid: { left: 0, right: 0, top: 0, bottom: 0 }
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCard = _sfc_main$k;
      const _component_UBadge = _sfc_main$c;
      _push(ssrRenderComponent(_component_UCard, mergeProps({ class: "bg-slate-900 border border-slate-700" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-4"${_scopeId}><div class="flex justify-between items-center mb-2"${_scopeId}><h3 class="text-xs font-bold text-slate-400 uppercase"${_scopeId}>Fitness / Generation</h3>`);
            if (!__props.isTrainingActive) {
              _push2(ssrRenderComponent(_component_UBadge, {
                color: "yellow",
                variant: "subtle",
                size: "xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Using Best Model `);
                  } else {
                    return [
                      createTextVNode(" Using Best Model ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="w-full" style="${ssrRenderStyle({ "min-height": "100px" })}"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(VChart), {
              option: chartOption.value,
              class: "w-full",
              style: { "height": "100px" }
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="flex justify-between mt-2 text-xs font-mono text-slate-500"${_scopeId}><span${_scopeId}>Gen: <span class="text-white"${_scopeId}>${ssrInterpolate(__props.currentGen)}</span></span><span${_scopeId}>Best: <span class="text-teal-400"${_scopeId}>${ssrInterpolate(__props.bestFitness.toFixed(0))}</span></span></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-4" }, [
                createVNode("div", { class: "flex justify-between items-center mb-2" }, [
                  createVNode("h3", { class: "text-xs font-bold text-slate-400 uppercase" }, "Fitness / Generation"),
                  !__props.isTrainingActive ? (openBlock(), createBlock(_component_UBadge, {
                    key: 0,
                    color: "yellow",
                    variant: "subtle",
                    size: "xs"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Using Best Model ")
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                createVNode("div", {
                  class: "w-full",
                  style: { "min-height": "100px" }
                }, [
                  createVNode(unref(VChart), {
                    option: chartOption.value,
                    class: "w-full",
                    style: { "height": "100px" }
                  }, null, 8, ["option"])
                ]),
                createVNode("div", { class: "flex justify-between mt-2 text-xs font-mono text-slate-500" }, [
                  createVNode("span", null, [
                    createTextVNode("Gen: "),
                    createVNode("span", { class: "text-white" }, toDisplayString(__props.currentGen), 1)
                  ]),
                  createVNode("span", null, [
                    createTextVNode("Best: "),
                    createVNode("span", { class: "text-teal-400" }, toDisplayString(__props.bestFitness.toFixed(0)), 1)
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FitnessChart.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_7$1 = Object.assign(_sfc_main$3, { __name: "FitnessChart" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Dashboard",
  __ssrInlineRender: true,
  props: {
    settings: {},
    setSettings: { type: Function },
    fitnessHistory: {},
    currentGen: {},
    bestFitness: {},
    gameState: {},
    onResetMatch: { type: Function },
    onResetGenome: { type: Function },
    onModeChange: { type: Function },
    onExportWeights: { type: Function },
    onImportWeights: { type: Function },
    onScriptRecompile: { type: Function }
  },
  setup(__props) {
    const props = __props;
    const scriptEditorOpen = ref(false);
    const infoModalOpen = ref(false);
    const isTrainingActive = computed(() => props.settings.gameMode === "TRAINING");
    const handleScriptSave = (code) => {
      saveScript(code);
      if (props.onScriptRecompile) {
        props.onScriptRecompile();
      }
    };
    const toggleRunning = () => {
      props.setSettings((s) => ({ ...s, isRunning: !s.isRunning }));
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ScriptEditor = __nuxt_component_0;
      const _component_InfoModal = __nuxt_component_1;
      const _component_UCard = _sfc_main$k;
      const _component_MatchConfiguration = __nuxt_component_3;
      const _component_UButton = _sfc_main$8$1;
      const _component_UIcon = _sfc_main$d$1;
      const _component_TrainingParameters = __nuxt_component_6$1;
      const _component_FitnessChart = __nuxt_component_7$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_ScriptEditor, {
        modelValue: scriptEditorOpen.value,
        "onUpdate:modelValue": ($event) => scriptEditorOpen.value = $event,
        onSave: handleScriptSave
      }, null, _parent));
      _push(ssrRenderComponent(_component_InfoModal, {
        modelValue: infoModalOpen.value,
        "onUpdate:modelValue": ($event) => infoModalOpen.value = $event
      }, null, _parent));
      _push(ssrRenderComponent(_component_UCard, { class: "bg-slate-800 border border-slate-700 shadow-2xl" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="space-y-6"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_MatchConfiguration, {
              settings: __props.settings,
              "set-settings": __props.setSettings,
              "game-state": __props.gameState,
              "on-open-script-editor": () => scriptEditorOpen.value = true,
              "on-open-info": () => infoModalOpen.value = true
            }, null, _parent2, _scopeId));
            _push2(`<div class="grid grid-cols-2 gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              color: __props.settings.isRunning ? "warning" : "success",
              onClick: toggleRunning,
              class: "flex items-center justify-center gap-2"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UIcon, {
                    name: __props.settings.isRunning ? "i-heroicons-pause" : "i-heroicons-play",
                    class: "w-4 h-4"
                  }, null, _parent3, _scopeId2));
                  _push3(` ${ssrInterpolate(__props.settings.isRunning ? "PAUSE" : "START")}`);
                } else {
                  return [
                    createVNode(_component_UIcon, {
                      name: __props.settings.isRunning ? "i-heroicons-pause" : "i-heroicons-play",
                      class: "w-4 h-4"
                    }, null, 8, ["name"]),
                    createTextVNode(" " + toDisplayString(__props.settings.isRunning ? "PAUSE" : "START"), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              color: "neutral",
              variant: "outline",
              onClick: props.onResetMatch
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` RESET `);
                } else {
                  return [
                    createTextVNode(" RESET ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_TrainingParameters, {
              settings: __props.settings,
              "set-settings": __props.setSettings,
              "best-fitness": __props.bestFitness,
              "game-state": __props.gameState,
              onExportWeights: props.onExportWeights,
              onImportWeights: props.onImportWeights,
              onResetGenome: props.onResetGenome
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_FitnessChart, {
              "fitness-history": __props.fitnessHistory,
              "current-gen": __props.currentGen,
              "best-fitness": __props.bestFitness,
              "is-training-active": isTrainingActive.value
            }, null, _parent2, _scopeId));
            if (isTrainingActive.value) {
              _push2(`<p class="text-[10px] text-slate-500 text-center italic"${_scopeId}> Visualizing evolution... Uncheck &quot;TRAINING&quot; to play manually. </p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "space-y-6" }, [
                createVNode(_component_MatchConfiguration, {
                  settings: __props.settings,
                  "set-settings": __props.setSettings,
                  "game-state": __props.gameState,
                  "on-open-script-editor": () => scriptEditorOpen.value = true,
                  "on-open-info": () => infoModalOpen.value = true
                }, null, 8, ["settings", "set-settings", "game-state", "on-open-script-editor", "on-open-info"]),
                createVNode("div", { class: "grid grid-cols-2 gap-2" }, [
                  createVNode(_component_UButton, {
                    color: __props.settings.isRunning ? "warning" : "success",
                    onClick: toggleRunning,
                    class: "flex items-center justify-center gap-2"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UIcon, {
                        name: __props.settings.isRunning ? "i-heroicons-pause" : "i-heroicons-play",
                        class: "w-4 h-4"
                      }, null, 8, ["name"]),
                      createTextVNode(" " + toDisplayString(__props.settings.isRunning ? "PAUSE" : "START"), 1)
                    ]),
                    _: 1
                  }, 8, ["color"]),
                  createVNode(_component_UButton, {
                    color: "neutral",
                    variant: "outline",
                    onClick: props.onResetMatch
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" RESET ")
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ]),
                createVNode(_component_TrainingParameters, {
                  settings: __props.settings,
                  "set-settings": __props.setSettings,
                  "best-fitness": __props.bestFitness,
                  "game-state": __props.gameState,
                  onExportWeights: props.onExportWeights,
                  onImportWeights: props.onImportWeights,
                  onResetGenome: props.onResetGenome
                }, null, 8, ["settings", "set-settings", "best-fitness", "game-state", "onExportWeights", "onImportWeights", "onResetGenome"]),
                createVNode(_component_FitnessChart, {
                  "fitness-history": __props.fitnessHistory,
                  "current-gen": __props.currentGen,
                  "best-fitness": __props.bestFitness,
                  "is-training-active": isTrainingActive.value
                }, null, 8, ["fitness-history", "current-gen", "best-fitness", "is-training-active"]),
                isTrainingActive.value ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-[10px] text-slate-500 text-center italic"
                }, ' Visualizing evolution... Uncheck "TRAINING" to play manually. ')) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Dashboard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main$2, { __name: "Dashboard" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ImportModal",
  __ssrInlineRender: true,
  props: {
    pendingImport: {},
    onConfirm: { type: Function },
    onCancel: { type: Function }
  },
  setup(__props) {
    const props = __props;
    const isOpen = computed({
      get: () => props.pendingImport !== null,
      set: (value) => {
        if (!value) {
          props.onCancel();
        }
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UModal = _sfc_main$l;
      const _component_UCard = _sfc_main$k;
      const _component_UButton = _sfc_main$8$1;
      _push(ssrRenderComponent(_component_UModal, mergeProps({
        open: isOpen.value,
        "onUpdate:open": ($event) => isOpen.value = $event,
        ui: { width: "max-w-md" }
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) ;
          else {
            return [];
          }
        }),
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UCard, null, {
              header: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<h3 class="text-2xl font-bold text-teal-400 mb-2"${_scopeId2}>Import Weights</h3>`);
                } else {
                  return [
                    createVNode("h3", { class: "text-2xl font-bold text-teal-400 mb-2" }, "Import Weights")
                  ];
                }
              }),
              footer: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="space-y-3"${_scopeId2}>`);
                  if (__props.pendingImport) {
                    _push3(ssrRenderComponent(_component_UButton, {
                      onClick: __props.onConfirm,
                      color: "success",
                      class: "w-full"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(` Continue Training (Gen ${ssrInterpolate(__props.pendingImport.generation)}) `);
                        } else {
                          return [
                            createTextVNode(" Continue Training (Gen " + toDisplayString(__props.pendingImport.generation) + ") ", 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(_component_UButton, {
                    onClick: __props.onCancel,
                    color: "neutral",
                    variant: "outline",
                    class: "w-full"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Cancel `);
                      } else {
                        return [
                          createTextVNode(" Cancel ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "space-y-3" }, [
                      __props.pendingImport ? (openBlock(), createBlock(_component_UButton, {
                        key: 0,
                        onClick: __props.onConfirm,
                        color: "success",
                        class: "w-full"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Continue Training (Gen " + toDisplayString(__props.pendingImport.generation) + ") ", 1)
                        ]),
                        _: 1
                      }, 8, ["onClick"])) : createCommentVNode("", true),
                      createVNode(_component_UButton, {
                        onClick: __props.onCancel,
                        color: "neutral",
                        variant: "outline",
                        class: "w-full"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Cancel ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ])
                  ];
                }
              }),
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (__props.pendingImport) {
                    _push3(`<div class="space-y-4"${_scopeId2}><div class="bg-slate-800/50 rounded-lg p-3 mb-4 text-sm font-mono"${_scopeId2}><span class="text-slate-400"${_scopeId2}>Generation:</span><span class="text-teal-300"${_scopeId2}>${ssrInterpolate(__props.pendingImport.generation)}</span><span class="mx-2 text-slate-600"${_scopeId2}>|</span><span class="text-slate-400"${_scopeId2}>Fitness:</span><span class="text-teal-300"${_scopeId2}>${ssrInterpolate(__props.pendingImport.genome.fitness.toFixed(0))}</span></div><p class="text-slate-400 mb-6 leading-relaxed text-sm"${_scopeId2}> This will inject the weights into training and continue from Generation ${ssrInterpolate(__props.pendingImport.generation)}. </p></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    __props.pendingImport ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "space-y-4"
                    }, [
                      createVNode("div", { class: "bg-slate-800/50 rounded-lg p-3 mb-4 text-sm font-mono" }, [
                        createVNode("span", { class: "text-slate-400" }, "Generation:"),
                        createVNode("span", { class: "text-teal-300" }, toDisplayString(__props.pendingImport.generation), 1),
                        createVNode("span", { class: "mx-2 text-slate-600" }, "|"),
                        createVNode("span", { class: "text-slate-400" }, "Fitness:"),
                        createVNode("span", { class: "text-teal-300" }, toDisplayString(__props.pendingImport.genome.fitness.toFixed(0)), 1)
                      ]),
                      createVNode("p", { class: "text-slate-400 mb-6 leading-relaxed text-sm" }, " This will inject the weights into training and continue from Generation " + toDisplayString(__props.pendingImport.generation) + ". ", 1)
                    ])) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UCard, null, {
                header: withCtx(() => [
                  createVNode("h3", { class: "text-2xl font-bold text-teal-400 mb-2" }, "Import Weights")
                ]),
                footer: withCtx(() => [
                  createVNode("div", { class: "space-y-3" }, [
                    __props.pendingImport ? (openBlock(), createBlock(_component_UButton, {
                      key: 0,
                      onClick: __props.onConfirm,
                      color: "success",
                      class: "w-full"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Continue Training (Gen " + toDisplayString(__props.pendingImport.generation) + ") ", 1)
                      ]),
                      _: 1
                    }, 8, ["onClick"])) : createCommentVNode("", true),
                    createVNode(_component_UButton, {
                      onClick: __props.onCancel,
                      color: "neutral",
                      variant: "outline",
                      class: "w-full"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Cancel ")
                      ]),
                      _: 1
                    }, 8, ["onClick"])
                  ])
                ]),
                default: withCtx(() => [
                  __props.pendingImport ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "space-y-4"
                  }, [
                    createVNode("div", { class: "bg-slate-800/50 rounded-lg p-3 mb-4 text-sm font-mono" }, [
                      createVNode("span", { class: "text-slate-400" }, "Generation:"),
                      createVNode("span", { class: "text-teal-300" }, toDisplayString(__props.pendingImport.generation), 1),
                      createVNode("span", { class: "mx-2 text-slate-600" }, "|"),
                      createVNode("span", { class: "text-slate-400" }, "Fitness:"),
                      createVNode("span", { class: "text-teal-300" }, toDisplayString(__props.pendingImport.genome.fitness.toFixed(0)), 1)
                    ]),
                    createVNode("p", { class: "text-slate-400 mb-6 leading-relaxed text-sm" }, " This will inject the weights into training and continue from Generation " + toDisplayString(__props.pendingImport.generation) + ". ", 1)
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ImportModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_7 = Object.assign(_sfc_main$1, { __name: "ImportModal" });
const useGameSettings = () => {
  const settings = ref({
    populationSize: 48,
    mutationRate: 0.1,
    hiddenLayers: [13],
    fps: 60,
    simulationSpeed: 1,
    gameMode: "TRAINING",
    isRunning: false,
    backgroundTraining: false,
    opponentType: "AI",
    player1Type: "AI",
    player2Type: "AI"
  });
  const settingsRef = ref(settings.value);
  watch(settings, (newValue) => {
    settingsRef.value = newValue;
  }, { deep: true });
  const setSettings = (updater) => {
    if (typeof updater === "function") {
      settings.value = updater(settings.value);
    } else {
      settings.value = updater;
    }
  };
  return { settings, setSettings, settingsRef };
};
const useGameState = () => {
  const gameState = ref({
    player1Health: 100,
    player2Health: 100,
    player1Energy: 100,
    player2Energy: 100,
    timeRemaining: 90,
    generation: 1,
    bestFitness: 0,
    matchActive: false,
    winner: null,
    roundStatus: "WAITING",
    matchesUntilEvolution: 3
  });
  const gameStateRef = ref(gameState.value);
  const matchTimerRef = ref(90);
  watch(gameState, (newValue) => {
    gameStateRef.value = newValue;
  }, { deep: true });
  const resetMatchTimer = () => {
    matchTimerRef.value = 90;
  };
  const setGameState = (updater) => {
    if (typeof updater === "function") {
      gameState.value = updater(gameState.value);
    } else {
      gameState.value = updater;
    }
  };
  return {
    gameState,
    setGameState,
    gameStateRef,
    matchTimerRef,
    resetMatchTimer
  };
};
const usePopulation = () => {
  const populationRef = ref([]);
  const bestTrainedGenomeRef = ref(null);
  const fitnessHistory = ref([]);
  const initPopulation = (settings, clearBest = true) => {
    const pop = [];
    for (let i = 0; i < settings.populationSize; i++) {
      pop.push({
        id: `gen1-${i}`,
        network: createRandomNetwork(),
        fitness: 0,
        matchesWon: 0
      });
    }
    populationRef.value = pop;
    if (clearBest) {
      bestTrainedGenomeRef.value = null;
    }
  };
  const getBestGenome = () => {
    if (bestTrainedGenomeRef.value) return bestTrainedGenomeRef.value;
    if (populationRef.value.length === 0) return null;
    const sorted = [...populationRef.value].sort((a, b) => b.fitness - a.fitness);
    return sorted[0] ?? null;
  };
  const setFitnessHistory = (updater) => {
    if (typeof updater === "function") {
      fitnessHistory.value = updater(fitnessHistory.value);
    } else {
      fitnessHistory.value = updater;
    }
  };
  return {
    populationRef,
    bestTrainedGenomeRef,
    fitnessHistory,
    setFitnessHistory,
    initPopulation,
    getBestGenome
  };
};
const useCustomScriptWorkers = (settings, addToast) => {
  const customScriptWorkerARef = ref(null);
  const customScriptWorkerBRef = ref(null);
  watch(() => [settings.value.gameMode, settings.value.opponentType, settings.value.player1Type, settings.value.player2Type], () => {
    const compileWorker = async (slot, workerRef) => {
      const scriptCode = loadScript(slot);
      if (!workerRef.value) {
        workerRef.value = new ScriptWorkerManager();
      }
      if (!workerRef.value.isReady()) {
        const result = await workerRef.value.compile(scriptCode);
        const name = slot === "slot1" ? "Script A" : "Script B";
        if (!result.success) {
          addToast("error", `${name} error: ${result.error}`);
        }
      }
    };
    const needsA = settings.value.gameMode === "TRAINING" && settings.value.player1Type === "CUSTOM_A" || settings.value.gameMode === "ARCADE" && (settings.value.player1Type === "CUSTOM_A" || settings.value.player2Type === "CUSTOM_A");
    const needsB = settings.value.gameMode === "TRAINING" && settings.value.player1Type === "CUSTOM_B" || settings.value.gameMode === "ARCADE" && (settings.value.player1Type === "CUSTOM_B" || settings.value.player2Type === "CUSTOM_B");
    if (needsA) compileWorker("slot1", customScriptWorkerARef);
    if (needsB) compileWorker("slot2", customScriptWorkerBRef);
  }, { immediate: true });
  const recompileCustomScript = async () => {
    const recompileSlot = async (slot, workerRef) => {
      const scriptCode = loadScript(slot);
      if (!scriptCode) return;
      if (!workerRef.value) {
        workerRef.value = new ScriptWorkerManager();
      }
      const result = await workerRef.value.compile(scriptCode);
      const name = slot === "slot1" ? "Script A" : "Script B";
      if (result.success) ;
      else {
        addToast("error", `${name} error: ${result.error}.`);
      }
    };
    if (customScriptWorkerARef.value) recompileSlot("slot1", customScriptWorkerARef);
    if (customScriptWorkerBRef.value) recompileSlot("slot2", customScriptWorkerBRef);
  };
  return {
    customScriptWorkerARef,
    customScriptWorkerBRef,
    recompileCustomScript
  };
};
function WorkerWrapper(options) {
  return new Worker(
    "" + __buildAssetsURL("TrainingWorker-BoQif5Bc.js"),
    {
      type: "module",
      name: options?.name
    }
  );
}
class WorkerPool {
  /**
   * Creates a new WorkerPool
   * 
   * @param workerCount - Number of workers (default: hardware cores, max 8)
   */
  constructor(workerCount) {
    this.workers = [];
    this.pendingJobs = [];
    this.activeJobs = /* @__PURE__ */ new Map();
    this.results = [];
    this.callback = null;
    this.expectedResults = 0;
    this.isProcessing = false;
    this.readyWorkers = /* @__PURE__ */ new Set();
    this.workerCount = workerCount ?? Math.min((void 0).hardwareConcurrency || 4, 8);
    this.initWorkers();
  }
  /**
   * Initializes the worker pool
   * 
   * Creates Web Worker instances from TrainingWorker.ts.
   * Each worker runs in a separate thread.
   */
  initWorkers() {
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new WorkerWrapper();
      const workerId = i;
      if (!worker) throw new Error("Worker creation failed");
      worker.onmessage = (messageEvent) => {
        this.handleWorkerMessage(workerId, messageEvent.data);
      };
      worker.onerror = (error) => {
        console.error(`Worker ${workerId} error:`, error);
      };
      this.workers.push(worker);
    }
  }
  /**
   * Handles messages received from workers
   * 
   * @param workerId - Which worker sent the message
   * @param data - Message payload
   */
  handleWorkerMessage(workerId, data) {
    if (data.type === "ready") {
      this.readyWorkers.add(workerId);
      return;
    }
    if (data.type === "matchResults" && data.results) {
      this.results.push(...data.results);
      if (this.results.length >= this.expectedResults) {
        this.isProcessing = false;
        if (this.callback) {
          const cb = this.callback;
          this.callback = null;
          cb(this.results);
        }
      }
    }
  }
  /**
   * Runs a batch of matches in parallel across workers
   * 
   * DISTRIBUTION ALGORITHM:
   * 1. Divide jobs evenly: ceil(totalJobs / workerCount)
   * 2. Assign each worker a slice of jobs
   * 3. Send jobs to workers in parallel
   * 4. Wait for all results to return
   * 
   * @param jobs - Array of match jobs to run
   * @returns Promise resolving to all match results
   */
  async runMatches(jobs) {
    return new Promise((resolve) => {
      if (jobs.length === 0) {
        resolve([]);
        return;
      }
      this.results = [];
      this.expectedResults = jobs.length;
      this.isProcessing = true;
      this.callback = resolve;
      const jobsPerWorker = Math.ceil(jobs.length / this.workerCount);
      for (let i = 0; i < this.workerCount; i++) {
        const start = i * jobsPerWorker;
        const end = Math.min(start + jobsPerWorker, jobs.length);
        const workerJobs = jobs.slice(start, end);
        if (workerJobs.length > 0) {
          this.workers[i].postMessage({ type: "runMatches", jobs: workerJobs });
        }
      }
    });
  }
  /**
   * Creates match jobs from a population
   * 
   * PAIRING STRATEGY:
   * - Fighters are paired sequentially: 0 vs 1, 2 vs 3, etc.
   * - Odd population: last genome fights random opponent
   * - Spawn positions have random offsets for variety
   * 
   * @param population - Array of genomes to create matches from
   * @returns Array of match jobs
   */
  static createJobsFromPopulation(population) {
    const jobs = [];
    const popSize = population.length;
    for (let i = 0; i < popSize; i += 2) {
      let p1Idx = i;
      let p2Idx = i + 1;
      if (p2Idx >= popSize) {
        p2Idx = Math.floor(Math.random() * p1Idx);
      }
      const spawnOffset1 = Math.random() * 100 - 50;
      const spawnOffset2 = Math.random() * 100 - 50;
      jobs.push({
        jobId: i / 2,
        genome1: population[p1Idx],
        genome2: population[p2Idx],
        spawn1X: 280 + spawnOffset1,
        // Left side
        spawn2X: 470 + spawnOffset2
        // Right side
      });
    }
    return jobs;
  }
  /**
   * Applies match results back to the population
   * 
   * After matches complete, this updates each genome's fitness
   * and matchesWon counters based on their results.
   * 
   * @param population - The genome array to update
   * @param jobs - Original job array (for ID matching)
   * @param results - Results from runMatches()
   */
  static applyResults(population, jobs, results) {
    const resultMap = /* @__PURE__ */ new Map();
    for (const result of results) {
      resultMap.set(result.jobId, result);
    }
    for (const job of jobs) {
      const result = resultMap.get(job.jobId);
      if (!result) continue;
      const g1 = population.find((g) => g.id === job.genome1.id);
      const g2 = population.find((g) => g.id === job.genome2.id);
      if (g1) {
        g1.fitness += result.genome1Fitness;
        if (result.genome1Won) g1.matchesWon++;
      }
      if (g2) {
        g2.fitness += result.genome2Fitness;
        if (result.genome2Won) g2.matchesWon++;
      }
    }
  }
  /**
   * Returns the number of workers in the pool
   */
  getWorkerCount() {
    return this.workerCount;
  }
  /**
   * Checks if all workers are initialized and ready
   */
  isReady() {
    return this.readyWorkers.size === this.workerCount;
  }
  /**
   * Checks if currently processing a batch of matches
   */
  isBusy() {
    return this.isProcessing;
  }
  /**
   * Terminates all workers and cleans up
   * 
   * Call this when you're done with the pool to free resources.
   */
  terminate() {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.readyWorkers.clear();
  }
}
const useBackgroundTraining = ({
  settings,
  setGameState,
  setFitnessHistory,
  populationRef,
  bestTrainedGenomeRef,
  currentMatchIndex
}) => {
  const workerPoolRef = ref(null);
  const isWorkerTrainingRef = ref(false);
  const runWorkerTrainingGeneration = async () => {
    if (isWorkerTrainingRef.value) return;
    isWorkerTrainingRef.value = true;
    const pop = populationRef.value;
    if (pop.length === 0) {
      isWorkerTrainingRef.value = false;
      return;
    }
    if (!workerPoolRef.value) {
      workerPoolRef.value = new WorkerPool();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const pool = workerPoolRef.value;
    try {
      const jobs = WorkerPool.createJobsFromPopulation(pop);
      const results = await pool.runMatches(jobs);
      WorkerPool.applyResults(pop, jobs, results);
      pop.sort((a, b) => b.fitness - a.fitness);
      const best = pop[0];
      if (!best) {
        isWorkerTrainingRef.value = false;
        return;
      }
      if (!bestTrainedGenomeRef.value || best.fitness > bestTrainedGenomeRef.value.fitness) {
        bestTrainedGenomeRef.value = JSON.parse(JSON.stringify(best));
      }
      let currentGen = 0;
      setGameState((prev) => {
        currentGen = prev.generation;
        return { ...prev, bestFitness: best.fitness, generation: prev.generation + 1 };
      });
      setFitnessHistory((prev) => [...prev.slice(-20), { gen: currentGen, fitness: best.fitness }]);
      const popSize = pop.length;
      if (pop.length < 2 || !pop[0]?.network || !pop[1]?.network) {
        isWorkerTrainingRef.value = false;
        return;
      }
      const newPop = [
        { ...pop[0], network: pop[0].network, fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-0` },
        { ...pop[1], network: pop[1].network, fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-1` }
      ];
      const adaptiveRate = Math.max(0.05, 0.3 - currentGen * 8e-3);
      const selectionPoolSize = Math.max(2, Math.floor(pop.length / 4));
      while (newPop.length < popSize) {
        const parentA = pop[Math.floor(Math.random() * selectionPoolSize)];
        const parentB = pop[Math.floor(Math.random() * selectionPoolSize)];
        if (!parentA?.network || !parentB?.network) {
          continue;
        }
        let childNet = crossoverNetworks(parentA.network, parentB.network);
        childNet = mutateNetwork(childNet, adaptiveRate);
        newPop.push({
          id: `gen${currentGen + 1}-${newPop.length}`,
          network: childNet,
          fitness: 0,
          matchesWon: 0
        });
      }
      populationRef.value = newPop;
      currentMatchIndex.value = 0;
    } catch (error) {
      console.error("Worker training error:", error);
    }
    isWorkerTrainingRef.value = false;
  };
  watch(() => [settings.value.backgroundTraining, settings.value.gameMode], () => {
    if (settings.value.backgroundTraining && settings.value.gameMode === "ARCADE") {
      const runContinuousTraining = async () => {
        while (settings.value.backgroundTraining && settings.value.gameMode === "ARCADE") {
          await runWorkerTrainingGeneration();
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      };
      runContinuousTraining();
    }
  }, { immediate: true });
  return { isWorkerTrainingRef };
};
class MatchSetup {
  static createFighter(type, x, defaultColor, isP2, settings, workers, bestGenome) {
    if (type === "HUMAN") {
      return new Fighter(x, "#22c55e", false);
    }
    if (type === "AI") {
      const genomeToUse = bestGenome || { id: "cpu", network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
      return new Fighter(x, defaultColor, true, genomeToUse);
    }
    if (type === "CUSTOM_A") {
      const f = new Fighter(x, "#a855f7", false);
      const worker = workers.workerA;
      if (worker && worker.isReady()) {
        f.isCustom = true;
        f.scriptWorker = worker;
      } else {
        f.isCustom = true;
      }
      return f;
    }
    if (type === "CUSTOM_B") {
      const f = new Fighter(x, "#14b8a6", false);
      const worker = workers.workerB;
      if (worker && worker.isReady()) {
        f.isCustom = true;
        f.scriptWorker = worker;
      } else {
        f.isCustom = true;
      }
      return f;
    }
    return new Fighter(x, defaultColor, false);
  }
}
function useMatchSetup(ctx) {
  const startMatch = () => {
    ctx.matchTimerRef.value = 90;
    const workers = {
      workerA: ctx.customScriptWorkerARef.value,
      workerB: ctx.customScriptWorkerBRef.value
    };
    const spawnFighter = (type, x, color, isP2) => MatchSetup.createFighter(type, x, color, isP2, ctx.settingsRef.value, workers, ctx.getBestGenome());
    if (ctx.settingsRef.value.gameMode === "TRAINING") {
      const popSize = ctx.populationRef.value.length;
      const p1Type = ctx.settingsRef.value.player1Type;
      const isP1AI = p1Type === "AI";
      const isP1Human = p1Type === "HUMAN";
      const EVOLUTION_INTERVAL = isP1Human ? 3 : isP1AI ? Math.floor(popSize / 2) : popSize;
      if (ctx.currentMatchIndex.value > 0 && ctx.currentMatchIndex.value % EVOLUTION_INTERVAL === 0) {
        ctx.evolve();
        return;
      }
      const matchesRemaining = EVOLUTION_INTERVAL - ctx.currentMatchIndex.value % EVOLUTION_INTERVAL;
      ctx.setGameState((prev) => ({ ...prev, matchesUntilEvolution: matchesRemaining }));
      const spawnOffset1 = Math.random() * 100 - 50;
      const spawnOffset2 = Math.random() * 100 - 50;
      let p1Color;
      let p1Fighter;
      let p1GenomeIdx;
      if (p1Type === "HUMAN") {
        p1Color = "#22c55e";
        p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
        p1GenomeIdx = -1;
      } else if (p1Type === "CUSTOM_A") {
        p1Color = "#a855f7";
        p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
        const worker = ctx.customScriptWorkerARef.value;
        if (worker && worker.isReady()) {
          p1Fighter.isCustom = true;
          p1Fighter.scriptWorker = worker;
        } else {
          p1Fighter.isCustom = true;
        }
        p1GenomeIdx = -1;
      } else if (p1Type === "CUSTOM_B") {
        p1Color = "#14b8a6";
        p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
        const worker = ctx.customScriptWorkerBRef.value;
        if (worker && worker.isReady()) {
          p1Fighter.isCustom = true;
          p1Fighter.scriptWorker = worker;
        } else {
          p1Fighter.isCustom = true;
        }
        p1GenomeIdx = -1;
      } else {
        p1Color = "#ef4444";
        if (isP1AI) {
          const p1Idx = ctx.currentMatchIndex.value * 2;
          let p2Idx = p1Idx + 1;
          if (p2Idx >= popSize) p2Idx = Math.floor(Math.random() * p1Idx);
          const g1 = ctx.populationRef.value[p1Idx];
          const g2 = ctx.populationRef.value[p2Idx];
          const swapSides = Math.random() > 0.5;
          const leftGenome = swapSides ? g2 : g1;
          const rightGenome = swapSides ? g1 : g2;
          p1Fighter = new Fighter(280 + spawnOffset1, p1Color, true, leftGenome);
          const p2Fighter2 = new Fighter(470 + spawnOffset2, "#3b82f6", true, rightGenome);
          p2Fighter2.direction = -1;
          ctx.activeMatchRef.value = { p1: p1Fighter, p2: p2Fighter2, p1GenomeIdx: p1Idx, p2GenomeIdx: p2Idx };
          return;
        } else {
          const genome = ctx.populationRef.value[ctx.currentMatchIndex.value] || ctx.getBestGenome() || { id: "cpu", network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
          p1Fighter = new Fighter(280 + spawnOffset1, p1Color, true, genome);
          p1GenomeIdx = ctx.currentMatchIndex.value;
        }
      }
      const p2GenomeIdx = isP1AI ? -1 : ctx.currentMatchIndex.value;
      const p2Genome = ctx.populationRef.value[p2GenomeIdx] || ctx.getBestGenome() || { id: "cpu", network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
      const p2Fighter = new Fighter(470 + spawnOffset2, "#3b82f6", true, p2Genome);
      p2Fighter.direction = -1;
      ctx.activeMatchRef.value = { p1: p1Fighter, p2: p2Fighter, p1GenomeIdx, p2GenomeIdx };
    } else {
      const p1Type = ctx.settingsRef.value.player1Type;
      const p2Type = ctx.settingsRef.value.player2Type;
      const spawnOffset = Math.random() * 60 - 30;
      const p1Color = p1Type === "HUMAN" ? "#22c55e" : "#ef4444";
      const p2Color = "#3b82f6";
      const f1 = spawnFighter(p1Type, 280 + spawnOffset, p1Color, false);
      const f2 = spawnFighter(p2Type, 470 - spawnOffset, p2Color, true);
      f2.direction = -1;
      ctx.activeMatchRef.value = { p1: f1, p2: f2, p1GenomeIdx: -1, p2GenomeIdx: -1 };
    }
    const isArcade = ctx.settingsRef.value.gameMode === "ARCADE";
    ctx.setGameState((prev) => ({
      ...prev,
      matchActive: true,
      timeRemaining: 90,
      winner: null,
      roundStatus: isArcade ? "WAITING" : "FIGHTING"
    }));
    if (ctx.gameStateRef.value) ctx.gameStateRef.value.roundStatus = isArcade ? "WAITING" : "FIGHTING";
    if (isArcade) {
      setTimeout(() => {
        if (ctx.activeMatchRef.value) {
          if (ctx.gameStateRef.value) ctx.gameStateRef.value.roundStatus = "FIGHTING";
          ctx.setGameState((prev) => ({ ...prev, roundStatus: "FIGHTING" }));
        }
      }, 1500);
    }
  };
  return { startMatch };
}
function useMatchUpdate(ctx) {
  const requestRef = ref(null);
  const update = () => {
    const currentSettings = ctx.settingsRef.value;
    const currentGameState = ctx.gameStateRef.value;
    if (!ctx.activeMatchRef.value) {
      const canStart = currentSettings.gameMode === "ARCADE" || ctx.populationRef.value.length > 0;
      if (canStart) {
        ctx.startMatch();
      }
      requestRef.value = requestAnimationFrame(update);
      return;
    }
    if (!currentSettings.isRunning || !ctx.activeMatchRef.value) {
      requestRef.value = requestAnimationFrame(update);
      return;
    }
    const match = ctx.activeMatchRef.value;
    const loops = currentSettings.gameMode === "ARCADE" ? 1 : currentSettings.simulationSpeed;
    let matchEnded = false;
    for (let i = 0; i < loops; i++) {
      if (!currentGameState.matchActive || matchEnded) break;
      const dummyInput = { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };
      const isP1Human = !match.p1.isAi && !match.p1.isCustom;
      let p1Input = isP1Human && ctx.inputManager.value ? ctx.inputManager.value.getState() : dummyInput;
      if (currentGameState.roundStatus === "WAITING") {
        p1Input = dummyInput;
      }
      match.p1.update(p1Input, match.p2);
      if (currentGameState.roundStatus === "WAITING") {
        match.p2.update(dummyInput, match.p1);
      } else {
        match.p2.update(dummyInput, match.p1);
      }
      const p1 = match.p1;
      const p2 = match.p2;
      const verticalOverlap = p1.y + p1.height > p2.y && p2.y + p2.height > p1.y;
      if (verticalOverlap) {
        if (p1.x < p2.x) {
          const overlap = p1.x + p1.width - p2.x;
          if (overlap > 0) {
            p1.x -= overlap / 2;
            p2.x += overlap / 2;
          }
        } else {
          const overlap = p2.x + p2.width - p1.x;
          if (overlap > 0) {
            p2.x -= overlap / 2;
            p1.x += overlap / 2;
          }
        }
      }
      p1.checkHit(p2);
      p2.checkHit(p1);
      if (currentGameState.roundStatus === "FIGHTING") {
        ctx.matchTimerRef.value -= 1 / 60;
      }
      const isTimeout = ctx.matchTimerRef.value <= 0;
      const isKO = p1.health <= 0 || p2.health <= 0;
      if (isKO || isTimeout) {
        matchEnded = true;
        if (currentSettings.gameMode === "TRAINING") {
          const p1Damage = 100 - p2.health;
          const p2Damage = 100 - p1.health;
          if (p1.genome) {
            p1.genome.fitness += p1Damage * 3 + p1.health * 2;
          }
          if (p2.genome) {
            p2.genome.fitness += p2Damage * 3 + p2.health * 2;
          }
          if (p1.health > 0 && p2.health <= 0) {
            if (p1.genome) {
              p1.genome.fitness += 500;
              p1.genome.matchesWon++;
            }
          } else if (p2.health > 0 && p1.health <= 0) {
            if (p2.genome) {
              p2.genome.fitness += 500;
              p2.genome.matchesWon++;
            }
          } else if (isTimeout) {
            if (p1.health > p2.health && p1.genome) {
              p1.genome.fitness += 200;
              p1.genome.matchesWon++;
            } else if (p2.health > p1.health && p2.genome) {
              p2.genome.fitness += 200;
              p2.genome.matchesWon++;
            }
          }
          if (isTimeout && p1Damage + p2Damage < 30) {
            if (p1.genome) p1.genome.fitness -= 100;
            if (p2.genome) p2.genome.fitness -= 100;
          }
          ctx.currentMatchIndex.value++;
          ctx.startMatch();
        } else {
          const playerWon = p1.health > p2.health;
          ctx.addToast(playerWon ? "success" : "info", playerWon ? "You Win!" : "AI Wins!");
          setTimeout(() => ctx.startMatch(), 1e3);
        }
        break;
      }
    }
    ctx.setGameState((prev) => ({
      ...prev,
      player1Health: match.p1.health,
      player2Health: match.p2.health,
      player1Energy: match.p1.energy,
      player2Energy: match.p2.energy,
      timeRemaining: Math.max(0, ctx.matchTimerRef.value)
    }));
    requestRef.value = requestAnimationFrame(update);
  };
  return { update, requestRef };
}
const useGameLoop = (ctx) => {
  const { startMatch } = useMatchSetup({
    settingsRef: ctx.settingsRef,
    gameStateRef: ctx.gameStateRef,
    setGameState: ctx.setGameState,
    activeMatchRef: ctx.activeMatchRef,
    currentMatchIndex: ctx.currentMatchIndex,
    populationRef: ctx.populationRef,
    getBestGenome: ctx.getBestGenome,
    matchTimerRef: ctx.matchTimerRef,
    customScriptWorkerARef: ctx.customScriptWorkerARef,
    customScriptWorkerBRef: ctx.customScriptWorkerBRef,
    evolve: ctx.evolve
  });
  const { update, requestRef } = useMatchUpdate({
    settingsRef: ctx.settingsRef,
    gameStateRef: ctx.gameStateRef,
    setGameState: ctx.setGameState,
    activeMatchRef: ctx.activeMatchRef,
    populationRef: ctx.populationRef,
    matchTimerRef: ctx.matchTimerRef,
    inputManager: ctx.inputManager,
    currentMatchIndex: ctx.currentMatchIndex,
    startMatch,
    addToast: ctx.addToast
  });
  return { update, startMatch, requestRef };
};
const useGenomeImportExport = ({
  getBestGenome,
  gameState,
  bestTrainedGenomeRef,
  populationRef,
  setGameState,
  gameStateRef,
  addToast
}) => {
  const pendingImport = ref(null);
  const handleExportWeights = () => {
    const bestGenome = getBestGenome();
    if (!bestGenome) {
      return;
    }
    const json = exportGenome(bestGenome, gameState.value.generation);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = (void 0).createElement("a");
    a.href = url;
    a.download = `neurofight-weights-gen${gameState.value.generation}-fitness${bestGenome.fitness.toFixed(0)}.json`;
    (void 0).body.appendChild(a);
    a.click();
    (void 0).body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("success", `Weights exported (Gen ${gameState.value.generation})!`);
  };
  const handleImportWeights = () => {
    const input = (void 0).createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        const result = importGenome(text);
        if (result.success === false) {
          addToast("error", result.error);
          return;
        }
        pendingImport.value = { genome: result.genome, generation: result.generation };
        addToast("info", `Loaded: Gen ${result.generation}, Fitness ${result.genome.fitness.toFixed(0)}`);
      };
      reader.readAsText(file);
    };
    input.click();
  };
  const handleImportChoice = () => {
    if (!pendingImport.value) return;
    const { genome, generation } = pendingImport.value;
    const arcadeGenome = { ...genome, id: `imported-${Date.now()}` };
    bestTrainedGenomeRef.value = arcadeGenome;
    const pop = populationRef.value;
    if (pop.length > 0) {
      const seedCount = Math.max(2, Math.floor(pop.length / 4));
      for (let i = 0; i < seedCount && i < pop.length; i++) {
        pop[i] = {
          ...genome,
          fitness: 0,
          matchesWon: 0,
          id: `imported-${Date.now()}-${i}`
        };
      }
    }
    setGameState((prev) => ({ ...prev, generation }));
    gameStateRef.value.generation = generation;
    pendingImport.value = null;
  };
  return {
    pendingImport,
    handleExportWeights,
    handleImportWeights,
    handleImportChoice,
    setPendingImport: (value) => {
      pendingImport.value = value;
    }
  };
};
const useDisclaimer = () => {
  const disclaimerStatus = ref("PENDING");
  const handleAcceptDisclaimer = () => {
    disclaimerStatus.value = "ACCEPTED";
  };
  const handleDeclineDisclaimer = () => {
    disclaimerStatus.value = "DECLINED";
  };
  const handleReturnToDisclaimer = () => {
    disclaimerStatus.value = "PENDING";
  };
  return {
    disclaimerStatus,
    handleAcceptDisclaimer,
    handleDeclineDisclaimer,
    handleReturnToDisclaimer
  };
};
const KEYS = {
  SETTINGS: "neuroevolution_settings_v1",
  BEST_GENOME: "neuroevolution_best_genome_v1",
  POPULATION: "neuroevolution_population_v1"
  // Optional: Save full state
};
const clearGenomeStorage = () => {
  try {
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.BEST_GENOME);
    localStorage.removeItem(KEYS.POPULATION);
  } catch (e) {
    console.warn("Failed to clear genome storage:", e);
  }
};
const pkgName = "neuroevolution-stickman-fighters";
const pkgVersion = "1.3.1";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const addToast = (type, message) => {
    };
    const { settings, setSettings, settingsRef } = useGameSettings();
    const {
      gameState,
      setGameState,
      gameStateRef,
      matchTimerRef,
      resetMatchTimer
    } = useGameState();
    const {
      populationRef,
      bestTrainedGenomeRef,
      fitnessHistory,
      setFitnessHistory,
      initPopulation,
      getBestGenome
    } = usePopulation();
    const {
      disclaimerStatus,
      handleAcceptDisclaimer,
      handleDeclineDisclaimer,
      handleReturnToDisclaimer
    } = useDisclaimer();
    const {
      pendingImport,
      handleExportWeights,
      handleImportWeights,
      handleImportChoice,
      setPendingImport
    } = useGenomeImportExport({
      getBestGenome,
      gameState,
      bestTrainedGenomeRef,
      populationRef,
      setGameState,
      gameStateRef,
      addToast
    });
    const activeMatchRef = ref(null);
    const currentMatchIndex = ref(0);
    const inputManager = ref(null);
    const { customScriptWorkerARef, customScriptWorkerBRef, recompileCustomScript } = useCustomScriptWorkers(settings, addToast);
    const resetPopulation = (clearBest = true) => {
      initPopulation(settings.value, clearBest);
      currentMatchIndex.value = 0;
      activeMatchRef.value = null;
      if (settings.value.gameMode === "TRAINING") {
        const isHumanOpponent = settings.value.player1Type === "HUMAN";
        const isAIOpponent = settings.value.player1Type === "AI";
        const popSize = populationRef.value.length;
        const evolutionInterval = isHumanOpponent ? 3 : isAIOpponent ? Math.floor(popSize / 2) : popSize;
        setGameState((prev) => ({ ...prev, matchesUntilEvolution: evolutionInterval }));
      }
    };
    const resetMatch = () => {
      setSettings((prev) => ({ ...prev, isRunning: false }));
      activeMatchRef.value = null;
      resetMatchTimer();
      let matchesRemaining = 3;
      if (settings.value.gameMode === "TRAINING") {
        const isHumanOpponent = settings.value.player1Type === "HUMAN";
        const isAIOpponent = settings.value.player1Type === "AI";
        const popSize = populationRef.value.length;
        const EVOLUTION_INTERVAL = isHumanOpponent ? 3 : isAIOpponent ? Math.floor(popSize / 2) : popSize;
        matchesRemaining = EVOLUTION_INTERVAL - currentMatchIndex.value % EVOLUTION_INTERVAL;
      }
      setGameState((prev) => ({
        ...prev,
        player1Health: 100,
        player2Health: 100,
        player1Energy: 100,
        player2Energy: 100,
        timeRemaining: 90,
        matchActive: false,
        winner: null,
        roundStatus: "WAITING",
        matchesUntilEvolution: matchesRemaining
      }));
    };
    const resetGenomeAndStorage = () => {
      resetPopulation(true);
      clearGenomeStorage();
    };
    const evolve = () => {
      const pop = populationRef.value;
      pop.sort((a, b) => b.fitness - a.fitness);
      const best = pop[0];
      if (!bestTrainedGenomeRef.value || best.fitness > bestTrainedGenomeRef.value.fitness) {
        bestTrainedGenomeRef.value = JSON.parse(JSON.stringify(best));
      }
      setFitnessHistory((prev) => [...prev.slice(-20), { gen: gameStateRef.value.generation, fitness: best.fitness }]);
      const isHumanOpponent = settingsRef.value.player1Type === "HUMAN";
      const isAIOpponent = settingsRef.value.player1Type === "AI";
      const popSize = populationRef.value.length;
      const nextEvolutionInterval = isHumanOpponent ? 3 : isAIOpponent ? Math.floor(popSize / 2) : popSize;
      setGameState((prev) => ({ ...prev, bestFitness: best.fitness, generation: prev.generation + 1, matchesUntilEvolution: nextEvolutionInterval }));
      const currentGen = gameStateRef.value.generation;
      const newPop = [
        { ...pop[0], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-0` },
        { ...pop[1], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-1` }
      ];
      const adaptiveRate = Math.max(0.05, 0.3 - currentGen * 8e-3);
      const selectionPoolSize = Math.max(2, Math.floor(pop.length / 4));
      while (newPop.length < settingsRef.value.populationSize) {
        const parentA = pop[Math.floor(Math.random() * selectionPoolSize)];
        const parentB = pop[Math.floor(Math.random() * selectionPoolSize)];
        let childNet = crossoverNetworks(parentA.network, parentB.network);
        childNet = mutateNetwork(childNet, adaptiveRate);
        newPop.push({
          id: `gen${currentGen + 1}-${newPop.length}`,
          network: childNet,
          fitness: 0,
          matchesWon: 0
        });
      }
      populationRef.value = newPop;
      currentMatchIndex.value = 0;
    };
    useGameLoop({
      settingsRef,
      gameStateRef,
      setGameState,
      activeMatchRef,
      currentMatchIndex,
      populationRef,
      getBestGenome,
      matchTimerRef,
      inputManager,
      customScriptWorkerARef,
      customScriptWorkerBRef,
      evolve,
      addToast
    });
    useBackgroundTraining({
      settings,
      setGameState,
      setFitnessHistory,
      populationRef,
      bestTrainedGenomeRef,
      currentMatchIndex
    });
    ref(null);
    const handleModeChange = (mode) => {
      setSettings((prev) => ({
        ...prev,
        gameMode: mode,
        isRunning: false,
        ...mode === "TRAINING" && {
          player1Type: prev.player1Type || "AI",
          player2Type: "AI"
        }
      }));
      let evolutionInterval = 3;
      if (mode === "TRAINING") {
        const isHumanOpponent = settings.value.player1Type === "HUMAN";
        const isAIOpponent = settings.value.player1Type === "AI";
        const popSize = populationRef.value.length;
        evolutionInterval = isHumanOpponent ? 3 : isAIOpponent ? Math.floor(popSize / 2) : popSize;
      }
      setGameState((prev) => ({
        ...prev,
        winner: null,
        matchActive: false,
        ...mode === "TRAINING" && { matchesUntilEvolution: evolutionInterval }
      }));
      activeMatchRef.value = null;
      if (mode === "TRAINING") {
        currentMatchIndex.value = 0;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GoodbyeScreen = __nuxt_component_0$2;
      const _component_DisclaimerModal = __nuxt_component_1$2;
      const _component_GameArena = __nuxt_component_2;
      const _component_ControlsHelper = __nuxt_component_3$1;
      const _component_TouchControls = __nuxt_component_4;
      const _component_NeuralNetworkVisualizer = __nuxt_component_5;
      const _component_Dashboard = __nuxt_component_6;
      const _component_ImportModal = __nuxt_component_7;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (unref(disclaimerStatus) === "DECLINED") {
        _push(ssrRenderComponent(_component_GoodbyeScreen, { "on-return": unref(handleReturnToDisclaimer) }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(disclaimerStatus) === "PENDING") {
        _push(ssrRenderComponent(_component_DisclaimerModal, {
          "on-accept": unref(handleAcceptDisclaimer),
          "on-decline": unref(handleDeclineDisclaimer)
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="${ssrRenderClass([
        "min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center py-8 transition-all duration-700",
        unref(disclaimerStatus) === "PENDING" ? "blur-md pointer-events-none" : ""
      ])}"><div class="w-full max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-3 gap-8"><div class="lg:col-span-2 space-y-4"><header class="flex justify-between items-center mb-4"><div><h3 class="text-lg sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500"> NeuroEvolution: Stickman Fighters </h3><p class="text-slate-400 text-sm">${ssrInterpolate(unref(settings).gameMode === "TRAINING" ? "Training Mode" : "Single Match Mode")}</p></div></header>`);
      _push(ssrRenderComponent(_component_GameArena, {
        "active-match": activeMatchRef.value.value ?? null,
        "game-state": unref(gameState),
        settings: unref(settings),
        "current-match-index": currentMatchIndex.value
      }, null, _parent));
      _push(ssrRenderComponent(_component_ControlsHelper, null, null, _parent));
      if (unref(settings).gameMode === "ARCADE") {
        _push(ssrRenderComponent(_component_TouchControls, {
          "input-manager": { value: inputManager.value.value }
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(gameState).matchActive && activeMatchRef.value?.value) {
        _push(ssrRenderComponent(_component_NeuralNetworkVisualizer, {
          class: "hidden md:block w-full",
          width: 800,
          height: 250,
          fighter: unref(settings).gameMode === "TRAINING" ? activeMatchRef.value?.value?.p2 : activeMatchRef.value?.value?.p2
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-6">`);
      _push(ssrRenderComponent(_component_Dashboard, {
        settings: unref(settings),
        "set-settings": unref(setSettings),
        "fitness-history": unref(fitnessHistory),
        "current-gen": unref(gameState).generation,
        "best-fitness": unref(gameState).bestFitness,
        "game-state": unref(gameState),
        "on-reset-match": resetMatch,
        "on-reset-genome": resetGenomeAndStorage,
        "on-mode-change": handleModeChange,
        "on-export-weights": unref(handleExportWeights),
        "on-import-weights": unref(handleImportWeights),
        "on-script-recompile": unref(recompileCustomScript)
      }, null, _parent));
      _push(ssrRenderComponent(_component_ImportModal, {
        "pending-import": unref(pendingImport),
        "on-confirm": unref(handleImportChoice),
        "on-cancel": () => unref(setPendingImport)(null)
      }, null, _parent));
      _push(`<footer class="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest font-bold"><span>${ssrInterpolate(pkgName)} v${ssrInterpolate(pkgVersion)}</span><a href="https://github.com/Nostromo-618/neuroevolution-stickman-fighters" target="_blank" rel="noreferrer" class="hover:text-teal-500 transition-colors"> GitHub Repo </a></footer></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-jhIikcKQ.mjs.map
