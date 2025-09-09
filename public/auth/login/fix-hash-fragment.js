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
  // Проверяем наличие хэша в URL
  if (window.location.hash) {
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
      
      // Проверяем, есть ли параметр error в URL
      const urlParams = new URLSearchParams(window.location.search);
      const hasError = urlParams.has('error');
      
      // Всегда перенаправляем на callback URL с параметрами из хэша
      // Это позволит избежать промежуточного состояния с ошибкой
      let callbackUrl = `/auth/callback?access_token=${encodeURIComponent(hashParams.access_token)}`;
        
        // Добавляем остальные параметры
        if (hashParams.expires_at) callbackUrl += `&expires_at=${encodeURIComponent(hashParams.expires_at)}`;
        if (hashParams.expires_in) callbackUrl += `&expires_in=${encodeURIComponent(hashParams.expires_in)}`;
        if (hashParams.refresh_token) callbackUrl += `&refresh_token=${encodeURIComponent(hashParams.refresh_token)}`;
        if (hashParams.token_type) callbackUrl += `&token_type=${encodeURIComponent(hashParams.token_type)}`;
        if (hashParams.type) callbackUrl += `&type=${encodeURIComponent(hashParams.type)}`;
        
        // Добавляем redirect параметр, если он есть в текущем URL
        if (urlParams.has('redirect')) {
          callbackUrl += `&redirect=${encodeURIComponent(urlParams.get('redirect'))}`;
        }
        
        // Всегда перенаправляем на callback URL
        window.location.href = callbackUrl;
      
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