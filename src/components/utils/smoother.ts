import ScrollSmoother from "./ScrollSmootherMock";

export let smoother: ScrollSmoother | null = null;

export const setSmoother = (val: ScrollSmoother | null) => {
  smoother = val;
};
