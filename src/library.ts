import { fromJs } from 'maraca';
import { createBrowserHistory, createMemoryHistory } from 'history';

const history =
  typeof window === 'undefined'
    ? createMemoryHistory()
    : createBrowserHistory();

const getUrl = value => {
  if (value.type !== 'list') return value.value || '';
  return value.value
    .map(v => (v.value.type === 'value' ? v.value.value : ''))
    .join('/');
};

export default {
  title: fromJs(() => value => {
    if (value && value.type === 'value') document.title = value.value;
  }),
  url: emit => {
    const run = v => {
      const url = getUrl(v);
      if (url.startsWith('http')) window.open(url, '_blank');
      else history.push(`/${url}`);
    };
    const toValue = location => ({
      ...fromJs(location.pathname.slice(1).split('/')),
      set: v => run(v),
    });
    emit(toValue(history.location));
    return history.listen(location => emit(toValue(location)));
  },
};
