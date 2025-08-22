# Прямой платеж

| API endpoint (POST)                 |
| ----------------------------------- |
| https://api.maibmerchants.md/v1/pay |

### **Параметры запроса (body)**

<table><thead><tr><th width="171">Параметр</th><th width="160">Обязательный</th><th>Тип</th><th>Описание</th></tr></thead><tbody><tr><td>amount</td><td>ДА</td><td><p>number(decimal)</p><p>≥1</p></td><td><p>Сумма транзакции в формате <strong>X.XX</strong></p><p>Например: <strong>10.25</strong> (currency=MDL) означает 10 лей и 25 бань.</p></td></tr><tr><td>currency</td><td>ДА</td><td>string(3)</td><td>Валюта транзакции (MDL/EUR/USD)</td></tr><tr><td>clientIp</td><td>ДА</td><td>string(15)</td><td>IP Покупателя</td></tr><tr><td>language</td><td>НЕТ</td><td>string(2)</td><td><p>Язык страницы <strong>maib ecomm checkout</strong> </p><p>Возможные значения: ro/en/ru</p><p>Если этот параметр не передан, страница будет отображаться на английском языке</p></td></tr><tr><td>description</td><td>НЕТ</td><td>string(124)</td><td><p>Описание платежа</p><p>Отображается на страницу <strong>maib ecomm checkout</strong></p></td></tr><tr><td>clientName</td><td>НЕТ</td><td>string(128)</td><td>Имя Покупателя</td></tr><tr><td>email</td><td>НЕТ</td><td>string(40)</td><td>Email Покупателя</td></tr><tr><td>phone</td><td>НЕТ</td><td>string(40)</td><td>Телефон Покупателя</td></tr><tr><td>orderId</td><td>НЕТ</td><td>string(36)</td><td>Идентификатор заказа с сайта/приложения</td></tr><tr><td>delivery</td><td>НЕТ</td><td>number(decimal)</td><td>Стоимость доставки в формате <strong>X.XX</strong></td></tr><tr><td>items</td><td>НЕТ</td><td><p>array</p><p>max. 50 items</p></td><td><p>Товары или услуги из заказа</p><p><br></p></td></tr><tr><td><ul><li><em>id</em></li></ul></td><td>нет</td><td>string(36)</td><td>ID товара</td></tr><tr><td><ul><li><em>name</em></li></ul></td><td>нет</td><td>string(128)</td><td>Название товара</td></tr><tr><td><ul><li><em>price</em></li></ul></td><td>нет</td><td>number(decimal)</td><td>Цена товара в формате <strong>X.XX</strong></td></tr><tr><td><ul><li><em>quantity</em> </li></ul></td><td>нет</td><td>integer(32)</td><td>Количество товаров</td></tr><tr><td>callbackUrl</td><td>НЕТ</td><td>string(2048)</td><td><p>Ссылка, по которой Мерчант получит окончательный ответ со статусом и данными транзакции.</p><p>Если вы не передадите этот параметр, его значение будет взято из <strong>maibmerchants</strong>.</p></td></tr><tr><td>okUrl</td><td>НЕТ</td><td>string(2048)</td><td><p>Ссылка, по которой Покупатель будет перенаправлен в случае успешной транзакции.</p><p>(GET request: okUrl + payId&#x26;orderId)</p><p>Если вы не передадите этот параметр, его значение будет взято из <strong>maibmerchants</strong>. </p></td></tr><tr><td>failUrl<br></td><td>НЕТ</td><td>string(2048)</td><td><p>Ссылка, по которой Покупатель будет перенаправлен в случае неудачной транзакции.</p><p>(GET request: failUrl + payId&#x26;orderId)</p><p>Если вы не передадите этот параметр, его значение будет взято из <strong>maibmerchants</strong>. </p></td></tr></tbody></table>

**Пример запроса**

```json
{
"amount": 10.25,
"currency": "MDL",
"clientIp": "135.250.245.121",
"language": "ru",
"description": "xxxxxx",
"clientName": "Имя Фамилия",
"email": "customer@gmail.com",
"phone": "069123456",
"orderId": "123",
"delivery": 1.25,
"items": [
{
"id": "10",
"name": "Товар 1",
"price": 2.50,
"quantity": 2
},
{
"id": "11",
"name": "Товар 2",
"price": 4,
"quantity": 1
}
],
"callbackUrl": "https://example.com/callback",
"okUrl": "https://example.com/ok",
"failUrl": "https://example.com/fail"
}
```

### **Параметры промежуточного ответа**

<table><thead><tr><th width="209.33333333333331">Параметр</th><th width="120">Тип</th><th>Описание</th></tr></thead><tbody><tr><td>result</td><td>Object</td><td>Объект содержащий идентификатор транзакции и ссылку перенаправления Покупателя</td></tr><tr><td><ul><li>payId</li></ul></td><td>String</td><td>Идентификатор транзакции от <strong>maib ecomm</strong> </td></tr><tr><td><ul><li>orderId</li></ul></td><td>String</td><td>Идентификатор заказа с сайта/приложения</td></tr><tr><td><ul><li>payUrl</li></ul></td><td>String</td><td>Ссылка на страницу <strong>maib ecomm checkout</strong> где Покупателя необходимо перенаправить для ввода данных карты.</td></tr><tr><td>ok</td><td>Boolean</td><td><p>Статус обработки запроса/транзакции:</p><p><em>true</em> - ошибок нет;</p><p><em>false -</em> есть ошибки (подробности ошибки будут отображаться в <em>errors);</em></p></td></tr><tr><td>errors</td><td>Array</td><td>Ошибки обработки запроса/транзакций. <a href="oshibki/oshibki-api"><mark style="color:blue;">Таблица ошибок</mark></a></td></tr><tr><td><ul><li>errorCode</li></ul></td><td>String</td><td>Код ошибки</td></tr><tr><td><ul><li>errorMessage</li></ul></td><td>String</td><td>Описание ошибки</td></tr><tr><td><ul><li>errorArgs</li></ul></td><td>Object</td><td>Объект содержит параметры с информацией об ошибке</td></tr></tbody></table>

**Пример промежуточного ответа**

{% tabs %}
{% tab title="Без ошибок" %}
```json
{
"result": {
"payId": "f16a9006-128a-46bc-8e2a-77a6ee99df75",
"orderId": "123",
"payUrl": "https://maib.ecommerce.md/ecomm01/ClientHandler?trans_id=rEsfhyIk8s9ypxkcS9fj/3C8FqA="
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
            "errorCode": "12001",
            "errorMessage": "Parameter 'amount' is invalid",
            "errorArgs": {
                "parameter": "amount"
            }
        }
    ],
    "ok": false
}
```
{% endtab %}
{% endtabs %}

### **Параметры окончательного ответа (на Callback Url)**

<table><thead><tr><th width="203.33333333333331">Параметр</th><th width="166">Тип</th><th>Описание </th></tr></thead><tbody><tr><td>result</td><td>Object</td><td>Объект содержащий данные транзакции</td></tr><tr><td><ul><li>payId</li></ul></td><td>String</td><td>Идентификатор транзакции от <strong>maib ecomm</strong> </td></tr><tr><td><ul><li>orderId</li></ul></td><td>String</td><td>Идентификатор заказа с сайта/приложения</td></tr><tr><td><ul><li>status</li></ul></td><td>String</td><td><p><a href="../status-tranzakcii-i-3d-secure#status-tranzakcii">Статус транзакции</a></p><p>OK - транзакция завершена успешно.</p></td></tr><tr><td><ul><li>statusCode</li></ul></td><td>String</td><td>Код статуса транзакции</td></tr><tr><td><ul><li>statusMessage</li></ul></td><td>String</td><td>Детали статуса транзакции</td></tr><tr><td><ul><li>threeDs</li></ul></td><td>String</td><td><p><a href="../status-tranzakcii-i-3d-secure#autentifikaciya-3d-secure">Результат аутентификации 3-D Secure</a></p><p>AUTHENTICATED - аутентификация прошла успешно.</p></td></tr><tr><td><ul><li>rrn</li></ul></td><td><br>String</td><td>RRN - Идентификатор транзакции, генерируемый <strong>maib.</strong></td></tr><tr><td><ul><li>approval</li></ul></td><td>String</td><td>Approval Code - Идентификатор подтверждения транзакции, сгенерированный банком-эмитентом карты.</td></tr><tr><td><ul><li>cardNumber</li></ul></td><td>String</td><td>Маскированный номер карты</td></tr><tr><td><ul><li>amount</li></ul></td><td>number(decimal)</td><td>Сумма сделки в формате <strong>X.XX</strong></td></tr><tr><td><ul><li>currency</li></ul></td><td>String</td><td>Валюта транзакции (MDL/EUR/USD)</td></tr><tr><td>signature</td><td>String</td><td>Подпись подтверждения ответа.</td></tr></tbody></table>

**Пример окончательного ответа**

```json
{
"result": {
"payId": "f16a9006-128a-46bc-8e2a-77a6ee99df75",
"orderId": "123",
"status": "OK",
"statusCode": "000",
"statusMessage": "Approved",
"threeDs": "AUTHENTICATED",
"rrn": "331711380059",
"approval": "327593",
"cardNumber": "510218******1124",
"amount": 10.25,
"currency": "MDL"
},
"signature": "r4KwwIUXQGHhcEM7C4um8o9rSrGEriTRcYQuBbmjEec="
}
```

