import { useEffect } from 'react';

/* React 19 умеет сам поднимать <title> и <meta> из компонента в <head>,
   но НЕ удаляет одноимённые теги из index.html — в документе оказывается
   два <title> и два description. Статические теги нужны краулерам соцсетей
   (они не выполняют JS), поэтому убрать их нельзя, и правильный путь —
   не добавлять новые, а переписывать существующие. */
const setMeta = (selector, content) => {
  const tag = document.head.querySelector(selector);
  if (tag) tag.setAttribute('content', content);
};

export const PageMeta = ({ title, description }) => {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
  }, [title, description]);

  return null;
};

export default PageMeta;
