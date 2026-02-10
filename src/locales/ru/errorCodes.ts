// locales/ru/errorCodes.ts
export const ERROR_CODE_MESSAGES: Record<string, string> = {
    // Валидация
    INVALID_INPUT: 'Некорректные данные',
    MISSING_PARAMETER: 'Отсутствует обязательный параметр',

    // Авторизация
    BAD_CREDENTIALS: 'Неверные учетные данные',
    AUTHORIZATION_ERROR: 'Ошибка авторизации',
    ACCESS_DENIED: 'Доступ запрещен',
    REFRESH_TOKEN_EXPIRED: 'Ваша сессия истекла. Пожалуйста, войдите в систему снова',
    REFRESH_TOKEN_NOT_FOUND: 'Ваша сессия была завершена на всех устройствах. Пожалуйста, войдите в систему снова',

    // Пользователи
    USER_ALREADY_EXIST: 'Пользователь с таким email уже существует',
    USER_NOT_FOUND: 'Пользователь не найден',
    USER_ALREADY_ACTIVATION: 'Аккаунт уже подтвержден',
    USER_ALREADY_PASSWORD_BOUND: 'Пароль уже установлен',
    USER_ALREADY_ADMIN: 'Пользователь уже является администратором',
    LOCAL_AUTH_NOT_FOUND: 'Локальная авторизация не найдена',
    ACCOUNT_BLOCKED: 'Ваш аккаунт заблокирован',
    ACCOUNT_DISABLED: 'Ваш аккаунт не активирован. Пожалуйста, проверьте почтовый ящик или отправьте письмо повторно',
    EMAIL_TOKEN_EXPIRED: 'Срок действия ссылки истёк',
    INVALID_EMAIL_TOKEN: 'Недействительная ссылка',

    // OAuth
    O_AUTH2_PROVIDER: 'Ошибка авторизации через провайдера',

    // Подтверждение email
    TOO_MANY_RESEND_VERIFICATION: 'Слишком много попыток повторной отправки письма',

    // История паролей
    PASSWORD_HISTORY: 'Новый пароль совпадает с предыдущим',

    // Сессии
    USER_NOT_HAVE_ACTIVE_SESSIONS: 'Нет активных сессий',

    // Задачи и решения
    UNSUPPORTED_TASK_TYPE: 'Неподдерживаемый тип задачи',
    SOLUTION_NOT_FOUND: 'Решение не найдено',
    TASK_NOT_FOUND: 'Задача не найдена',

    INTERNAL_SERVER_ERROR: 'Произошла внутренняя ошибка сервера. Пожалуйста, попробуйте позже'
};