import { _____log } from "../../../../log/log.mjs";

// Collect all the parent nodes of a given node
function getParents(node) {
  const nodes = [];
  for (; node; node = node.parentNode) {
    nodes.unshift(node); // Unshift adds to the beginning of the array
  }
  return nodes;
}

// Find the closest common ancestor between two nodes
export function commonAncestor(node1, node2) {
  if (!node1 || !node2) {
    throw new Error("Both nodes must be provided to find a common ancestor.");
  }

  if (node1 === node2) return node2.parentNode; // Edge case: Same node

  const parents1 = getParents(node1);
  const parents2 = getParents(node2);

  // If the root element differs, there's no common ancestor
  if (parents1[0] !== parents2[0]) {
    _____log("No common ancestor found.");
    throw new Error("No common ancestor found!");
  }

  // Traverse up the parent chains to find the deepest common ancestor
  for (let i = 0; i < parents1.length; i++) {
    if (parents1[i] !== parents2[i]) {
      return parents1[i - 1]; // Return the most recent common parent
    }
  }

  return null; // No common ancestor found
}
