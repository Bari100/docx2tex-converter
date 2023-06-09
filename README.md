# docx2tex app

## настройка окружения
- у вас дожен быть установлен docx2tex
- в корне проекта нужно создать .env.local, в котором создаем переменную `DOCX_2_TEX_ABSOLUTE_PATH`, значением которой будет абсолютный путь к d2t
пример:
```bash
DOCX_2_TEX_ABSOLUTE_PATH=/Users/username/Downloads/docx2tex/d2t
```

## установка и запуск при помозщи npm
```bash
npm i
npm run dev
```

## открыть
`http://localhost:3000`

