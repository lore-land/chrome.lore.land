import {_____log} from "../../../../log/log.mjs";

function parents(node) {
  const nodes = [node];
  for (; node; node = node.parentNode) {
    nodes.unshift(node)
  }
  return nodes
}

export function commonAncestor(node1, node2) {
  if (node1 === node2) return node2.parentNode;
  const parents1 = parents(node1);
  const parents2 = parents(node2);

  if (parents1[0] != parents2[0]) {
    _____log('No ancestor')
    throw "No common ancestor!"
  }

  for (let i = 0; i < parents1.length; i++) {
    if (parents1[i] != parents2[i]) return parents1[i - 1]
  }
}