# Генерация Токена доступа

Для генерация Токена вам потребуется _Project ID_ и _Project Secret_, которые доступны после активация Проекта в [_**maibmerchants**_](https://maibmerchants.md).

Для Тестового Проекта _Project ID_ и _Project Secret_ будут доступны сразу после заполнения обязательных полей (IP, платформа, Callback URL, Ok URL, Fail URL).

#### Этапы аутентификации через Токен доступа

1. Отправьте запрос на эндпоинт генерации токена используя _Project ID_ и _Project Secret._ Если переданные данные действительны, вы получите в ответ Токен (срок действия токена) и Refresh Token (срок действия Refresh Token).
2. Если срок действия токена истек, используйте Refresh Token, чтобы сгенерировать новый Токен доступа. Если срок действия Refresh Token также истек, используйте _Project ID_ и _Project Secret_ (см. пункт 1).
3. Делайте запросы к _**maib ecomm**_, используя Токен доступа.

### 1. Генерация токена с использованием _Project ID_ и _Project Secret_

**Параметры запроса (body)**

<table><thead><tr><th>Параметр</th><th width="151">Обязательный</th><th width="94">Тип</th><th>Описание</th></tr></thead><tbody><tr><td>projectId</td><td>ДА</td><td>string</td><td><em>Project ID</em> из Проекта в <em><strong>maibmerchants</strong></em></td></tr><tr><td>projectSecret</td><td>ДА</td><td>string</td><td><em>Project Secret</em> из Проекта в <em><strong>maibmerchants</strong></em></td></tr></tbody></table>

**Пример запроса (CURL)**

```json
curl --location --request POST "https://api.maibmerchants.md/v1/generate-token" \
    --header 'Content-Type: application/json' \
    --data-raw '{
    "projectId": "8508706",
    "projectSecret": "60462913-da44-47fa-8c82-146b676729b9"
    }'
```

**Параметры ответа**

<table><thead><tr><th width="224.33333333333331">Параметр</th><th width="119">Тип</th><th>Описание</th></tr></thead><tbody><tr><td>result</td><td>Object</td><td>Объект, содержащий Токен и Refresh Token.</td></tr><tr><td><ul><li>accessToken</li></ul></td><td>string</td><td>Токен доступа</td></tr><tr><td><ul><li>expiresIn</li></ul></td><td>integer</td><td>Время жизни Токена доступа в секундах</td></tr><tr><td><ul><li>refreshToken</li></ul></td><td>string</td><td>Refresh Token для генерация нового Токена доступа.</td></tr><tr><td><ul><li>refreshExpiresIn</li></ul></td><td>integer</td><td>Время жизни Refresh Token в секундах</td></tr><tr><td><ul><li>tokenType</li></ul></td><td>string</td><td>Тип токена (<em>Bearer</em>)</td></tr><tr><td>ok</td><td>Boolean</td><td><p>Статус обработки запроса:</p><p><em>true</em> - ошибок нет;</p><p><em>false -</em> есть ошибки (подробности ошибки будут отображаться в <em>errors);</em></p></td></tr><tr><td>errors</td><td>Array</td><td>Ошибки обработки запроса</td></tr><tr><td><ul><li>errorCode</li></ul></td><td>string</td><td>Код ошибки</td></tr><tr><td><ul><li>errorMessage</li></ul></td><td>string</td><td>Описание ошибки</td></tr></tbody></table>

**Пример ответа**

{% tabs %}
{% tab title="Без ошибок" %}
```json
"result": {
    "accessToken": "xxxxxx",
    "expiresIn": 300,
    "refreshToken": "xxxxxx",
    "refreshExpiresIn": 1800,
    "tokenType": "Bearer"
  },
  "ok": true
}
```
{% endtab %}

{% tab title="С ошибками " %}
```json
{
    "errors": [
        {
            "errorCode": "11001",
            "errorMessage": "Invalid credentials. Please check 'projectId' and 'projectSecret' parameters"
        }
    ],
    "ok": false
}
```
{% endtab %}
{% endtabs %}

### 2. Генерация Токена с помощью Refresh Token

**Параметры запроса (body)**

<table><thead><tr><th width="160">Параметр</th><th width="155">Обязательный</th><th width="92">Тип</th><th>Описание</th></tr></thead><tbody><tr><td>refreshToken</td><td>ДА</td><td>string</td><td>Refresh Token</td></tr></tbody></table>

**Пример запроса**

```json
curl --location --request POST "https://api.maibmerchants.md/v1/generate-token" \
    --header 'Content-Type: application/json' \
    --data-raw '{
    "refreshToken": "xxxxxxxxxxxxx"
    }'
```

**Пример ответа**

{% tabs %}
{% tab title="Без ошибок" %}
```json
"result": {
    "accessToken": "xxxxxx",
    "expiresIn": 300,
    "refreshToken": "xxxxxx",
    "refreshExpiresIn": 1800,
    "tokenType": "Bearer"
  },
  "ok": true
}
```
{% endtab %}

{% tab title="С ошибками" %}
```json
{
    "errors": [
        {
            "errorCode": "11002",
            "errorMessage": "Invalid or expired 'refreshToken' parameter"
        }
    ],
    "ok": false
}
```
{% endtab %}
{% endtabs %}

### 3. Пример запроса (прямой платеж) с аутентификацией через Токен&#x20;

```json
curl -X 'POST' \
  'https://api.maibmerchants.md/v1/pay' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer access_token' \
  -H 'Content-Type: application/json' \
  -d '{
  "clientIp": "135.250.245.121",
  "amount": 10.25,
  "currency": "MDL",
  "description": "Описание",
  "language": "ru",
  "orderId": "123",
  "clientName": "Имя Фамилия",
  "email": "customer@gmail.com",
  "phone": "069123456",
  "delivery": 1.25,
  "items": [
    {
      "id": "123",
      "name": "Product",
      "price": 2.5,
      "quantity": 2
    }
  ],
  "callbackUrl": "https://example.com/callback",
  "okUrl": "https://example.com/ok",
  "failUrl": "https://example.com/fail"
}'
```
