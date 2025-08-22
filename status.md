---
description: Значения параметров «status» и «threeDs» на Callback URL
---

# Статус транзакции и 3D-Secure

### Статус транзакции

<table><thead><tr><th width="164">status</th><th>Описание</th></tr></thead><tbody><tr><td>OK</td><td>Успешная транзакция</td></tr><tr><td>FAILED</td><td>Неуспешная транзакция</td></tr><tr><td>CREATED</td><td><p>Транзакция создана, но еще не завершена.</p><p>Мерчант получил промежуточный ответ от <strong>maib ecomm</strong> (<em>payId/payUrl</em>), но Покупатель еще не произвел платеж на странице оформления заказа <strong>maib ecomm checkout</strong>.</p></td></tr><tr><td>PENDING</td><td><p>Транзакция в стадии обработки.</p><p></p><p>Для <em>savecard-recurring/savecard-oneclick</em> без параметра <em>amount</em>: реквизиты карты успешно сохранены в системе <strong>maib ecomm</strong>.</p></td></tr><tr><td>DECLINED</td><td>Транзакция отклонена системой <strong>maib ecomm</strong>.</td></tr><tr><td>TIMEOUT</td><td><p>Время, отведенное на транзакцию, истекло (10 минут с момента получения <em>промежуточного ответа</em>).</p><p>Мерчант получил <em>промежуточный ответ</em> от <strong>maib ecom</strong> (<em>paId/payUrl</em>), но Покупатель не произвел платеж на странице <strong>maib ecomm checkout</strong> в течение времени, отведенного на транзакцию.</p></td></tr></tbody></table>

### Аутентификация 3D-Secure

<table><thead><tr><th width="230.5">threeDs</th><th>Описание</th></tr></thead><tbody><tr><td>AUTHENTICATED</td><td>Процесс аутентификации 3DS успешно завершен и личность владельца карты подтверждена.</td></tr><tr><td>NOT_AUTHENTICATED</td><td>Процесс аутентификации 3DS не был завершен или не удалось проверить личность владельца карты.</td></tr><tr><td>UNAVAILABLE</td><td>Сервис аутентификации 3DS в настоящее время недоступен и процесс аутентификации не может быть инициирован.</td></tr><tr><td>ATTEMPTED</td><td>Предпринята попытка аутентификации транзакции, но процесс не может быть завершен. Это может быть вызвано техническими проблемами или ошибками в процессе аутентификации.</td></tr><tr><td>REJECTED</td><td>Эмитент карты отклонил аутентификацию. Для получения дополнительной информации свяжитесь с эмитентом карты.</td></tr><tr><td>SKIPPED</td><td>Аутентификация была пропущена на основе динамических правил 3D Secure.</td></tr><tr><td>NOTPARTICIPATED</td><td>Карта не является частью программы 3D Secure.</td></tr></tbody></table>
