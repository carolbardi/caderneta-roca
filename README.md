# Caderneta Roça

Orçamento compartilhado da Carol e da Laura. Cada linha do orçamento é um **canteiro** com limite
semanal e/ou mensal, e uma arvorezinha mostra como ele está:

- **Florida:** gastou até 70% do limite.
- **Amarelando:** entre 70% e 100%.
- **Seca:** passou do limite.

App web instalável no celular (PWA), publicado no GitHub Pages. Os dados ficam no Supabase, com
acesso liberado só para os e-mails cadastrados na tabela `membros`.

## Configuração (uma vez só)

### 1. Supabase

1. **SQL Editor > New query**: cole o conteúdo de `supabase/schema.sql` e rode.
2. Na mesma tela, rode `supabase/dados-iniciais.local.sql`. Esse arquivo tem os e-mails e valores e
   **não vai para o GitHub**.
3. **Authentication > URL Configuration**:
   - Site URL: `https://carolbardi.github.io/caderneta-roca/`
   - Redirect URLs: `https://carolbardi.github.io/caderneta-roca/**` e `http://localhost:5180/caderneta-roca/**`
4. **Authentication > Emails > Magic Link**: para o código funcionar no app instalado no iPhone,
   acrescente o código ao corpo do e-mail, por exemplo:

   ```html
   <h2>Caderneta Roça</h2>
   <p>Seu código de entrada: <b>{{ .Token }}</b></p>
   <p>Ou toque aqui: <a href="{{ .ConfirmationURL }}">entrar</a></p>
   ```

5. Depois que as duas tiverem entrado uma vez, dá para desligar novos cadastros em
   **Authentication > Sign In / Providers > Allow new users to sign up**.

### 2. GitHub

1. Crie o repositório `caderneta-roca` (pode ser público: o código não tem dados pessoais).
2. Rode `npm run publicar`. Ele compila com o `.env.local` e envia o site pronto para o ramo `gh-pages`.
3. **Settings > Pages > Build and deployment**: Source **Deploy from a branch**, ramo `gh-pages`, pasta `/ (root)`.
4. O site fica em `https://carolbardi.github.io/caderneta-roca/`. Para atualizar, rode `npm run publicar` de novo.

### 3. No celular

Abra o link, entre com o e-mail e o código, e use **Compartilhar > Adicionar à Tela de Início**
(iPhone) ou **menu > Instalar app** (Android).

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # preencha a URL e a chave
npm run dev -- --port 5180    # http://localhost:5180/caderneta-roca/
```

Prévia das árvores sem login: `http://localhost:5180/caderneta-roca/?previa`.
