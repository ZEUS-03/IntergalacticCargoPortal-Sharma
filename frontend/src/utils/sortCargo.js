export default function sortCargo(records) {
  const items = [...records];

  items.sort((left, right) => {
    const leftIsEarth = left.destination === "Earth";
    const rightIsEarth = right.destination === "Earth";

    if (leftIsEarth && rightIsEarth) {
      return 0;
    }

    if (leftIsEarth) {
      return 1;
    }

    if (rightIsEarth) {
      return -1;
    }

    return Number(right.weight_kg) - Number(left.weight_kg);
  });

  return items;
}

/*
Expected output for the manifest sample:
- Earth records always appear last.
- Among non-Earth records, heaviest weight_kg appears first.
- Example: CRG-008 (Earth, 9999) is still last even though it is the heaviest raw weight.
*/
