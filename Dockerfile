# 使用 Node 作为基础镜像
FROM node:20.17.0 AS base

FROM base AS deps

# 设置工作目录
WORKDIR /app

# 复制所有文件
COPY . .

# 设置nodejs 内存限制
ENV NODE_OPTIONS = "--max_old_space_size=4096"

# 配置npm、pnpm源 下在依赖包
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com/ && \
    pnpm install --frozen-lockfile

COPY . .

# 把下载依赖包 丢失的dist手动打包回来
RUN cd ./apps/web/node_modules/novel
RUN npm run build

# 在根目录打包项目
WORKDIR /app
RUN pnpm run build

# 进入到 apps/web 目录启动
WORKDIR /app/apps/web

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["pnpm", "start"]
