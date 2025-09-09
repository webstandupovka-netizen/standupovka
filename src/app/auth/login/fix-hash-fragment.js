// Скрипт для исправления проблемы с хэш-фрагментом в URL при аутентификации

// Функция для извлечения параметров из хэш-фрагмента URL
function extractHashParams() {
  if (!window.location.hash) return null;
  
  try {
    // Получаем хэш без символа #
    const hash = window.location.hash.substring(1);
    
    // Разбираем параметры
    const params = {};
    hash.split('&').forEach(part => {
      const [key, value] = part.split('=');
      params[key] = decodeURIComponent(value);
    });
    
    return params;
  } catch (error) {
    console.error('Error parsing hash fragment:', error);
    return null;
  }
}

// Функция для перенаправления с параметрами из хэша
function redirectWithHashParams() {
  // Проверяем наличие хэша и параметра error в URL
  const urlParams = new URLSearchParams(window.location.search);
  const hasError = urlParams.has('error');
  
  // Если уже есть ошибка в URL и есть хэш-фрагмент, обрабатываем его
  if (hasError && window.location.hash) {
    const hashParams = extractHashParams();
    
    if (hashParams && hashParams.access_token) {
      // Создаем новый URL без хэша, но с токеном доступа в параметрах запроса
      const newUrl = new URL(window.location.href.split('#')[0]);
      
      // Добавляем параметр access_token в URL
      newUrl.searchParams.set('access_token', hashParams.access_token);
      
      // Если есть другие параметры, добавляем их тоже
      if (hashParams.expires_at) newUrl.searchParams.set('expires_at', hashParams.expires_at);
      if (hashParams.expires_in) newUrl.searchParams.set('expires_in', hashParams.expires_in);
      if (hashParams.refresh_token) newUrl.searchParams.set('refresh_token', hashParams.refresh_token);
      if (hashParams.token_type) newUrl.searchParams.set('token_type', hashParams.token_type);
      if (hashParams.type) newUrl.searchParams.set('type', hashParams.type);
      
      // Перенаправляем на новый URL без хэша
      window.history.replaceState(null, '', newUrl.toString());
      
      console.log('Fixed hash fragment in URL');
    }
  }
}

// Запускаем функцию при загрузке страницы
if (typeof window !== 'undefined') {
  // Выполняем сразу при загрузке скрипта
  redirectWithHashParams();
  
  // Также добавляем обработчик на изменение хэша
  window.addEventListener('hashchange', redirectWithHashParams);
}