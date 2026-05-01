FROM nginx:stable-alpine AS runtime

ARG APP_NAME=web-antd

# 配置 nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# 复制 nginx 模板配置
COPY scripts/deploy/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

FROM runtime AS prebuilt

ARG APP_NAME=web-antd

# 复制本机已构建的产物，适合本地 Docker 快速部署与验证
COPY apps/${APP_NAME}/dist /usr/share/nginx/html

FROM node:22-slim AS builder

ARG APP_NAME=web-antd

# --max-old-space-size
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV TZ=Asia/Shanghai

RUN npm i -g corepack && corepack enable

WORKDIR /app

# copy package.json and pnpm-lock.yaml to workspace
COPY . /app

# 安装依赖
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build --filter=@vben/${APP_NAME}

RUN echo "Builder Success"

FROM runtime AS production

ARG APP_NAME=web-antd

# 复制 Docker 内构建产物
COPY --from=builder /app/apps/${APP_NAME}/dist /usr/share/nginx/html
