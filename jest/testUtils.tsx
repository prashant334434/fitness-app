import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act, ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';

export function render(el: React.ReactElement) {
  let r!: ReactTestRenderer;
  act(() => {
    r = renderer.create(el);
  });
  return r;
}

/** Flattened string content of a <Text> (including nested <Text> children). */
export function textOf(node: ReactTestInstance): string {
  return node.children.map(c => (typeof c === 'string' ? c : textOf(c))).join('');
}

/** Outermost <Text> nodes whose full content equals / matches `q`. */
export function allText(root: ReactTestRenderer, q: string | RegExp) {
  return root.root.findAll(
    n => n.type === Text && (typeof q === 'string' ? textOf(n) === q : q.test(textOf(n))) && !(n.parent && n.parent.type === Text),
  );
}
export const getText = (root: ReactTestRenderer, q: string | RegExp) => {
  const hits = allText(root, q);
  if (!hits.length) throw new Error(`No <Text> matching ${q}`);
  return hits[0];
};
export const hasText = (root: ReactTestRenderer, q: string | RegExp) => allText(root, q).length > 0;

/** First element carrying this testID (the outermost, i.e. the one that owns the props). */
export function byId(root: ReactTestRenderer, id: string) {
  return root.root.find(n => n.props.testID === id && !(n.parent && n.parent.props.testID === id));
}

export function press(node: ReactTestInstance) {
  act(() => {
    node.props.onPress?.({});
  });
}

export const styleOf = (node: ReactTestInstance) => StyleSheet.flatten(node.props.style) ?? {};

export function makeNav() {
  return { navigate: jest.fn(), goBack: jest.fn(), popToTop: jest.fn() } as any;
}

/** Presses the nearest pressable ancestor of the <Text> matching `q`. */
export function pressText(root: ReactTestRenderer, q: string | RegExp) {
  let n: ReactTestInstance | null = getText(root, q);
  while (n && !n.props.onPress) n = n.parent;
  if (!n) throw new Error(`No pressable around ${q}`);
  press(n);
}
