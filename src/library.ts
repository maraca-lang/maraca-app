import { toData } from 'maraca';
import { createBrowserHistory, createMemoryHistory } from 'history';

const history =
  typeof window === 'undefined'
    ? createMemoryHistory()
    : createBrowserHistory();

const map = m => emit => value => emit(toData(m(value)));

const getUrl = value => {
  if (value.type !== 'list') return value.value || '';
  return value.value.indices
    .map(v => (v.type === 'value' ? v.value : ''))
    .join('/');
};

export default {
  title: toData(
    map(x => {
      if (x.type === 'value') document.title = x.value;
    }),
  ),
  url: emit => {
    const run = v => {
      const url = getUrl(v);
      if (url.startsWith('http')) window.open(url, '_blank');
      else history.push(`/${url}`);
    };
    const toValue = location => ({
      ...toData(location.pathname.slice(1).split('/')),
      set: v => run(v),
    });
    emit(toValue(history.location));
    return history.listen(location => emit(toValue(location)));
  },
};
