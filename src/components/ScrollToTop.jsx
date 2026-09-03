import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* Роутер меняет содержимое, но не трогает прокрутку, поэтому
   переход со дна длинной страницы открывает новую посередине.
   Ничего не рисует — только побочный эффект на смену маршрута. */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    /* Браузер сам прокручивает к якорю только при полной загрузке
       страницы; при клиентском переходе секции может ещё не быть
       в DOM, поэтому ищем её после отрисовки. */
    const id = hash.slice(1);
    const target = document.getElementById(id);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
