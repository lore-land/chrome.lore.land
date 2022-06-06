export async function setLocal(key, value) {
  let res, rej;
  const promise = new Promise((_y, _n) => { [res, rej] = [_y, _n] });
  chrome.storage.local.set({[key]: value}, function () {
    res({[key]: value});
  })
  return promise;
}

export async function getLocal(key) {
  let res, rej;
  const promise = new Promise((_y, _n) => { [res, rej] = [_y, _n] });
  chrome.storage.local.get([key], result => res(result[key]));
  return promise;
}

export async function getMultipleLocal(keys) {
  let res, rej;
  const promise = new Promise((_y, _n) => { [res, rej] = [_y, _n] });
  chrome.storage.local.get(keys, result => res(result));
  return promise;
}