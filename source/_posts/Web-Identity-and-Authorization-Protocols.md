---
categories: Study
cover: ../post_images/Web-Identity-and-Authorization-Protocols.jpg
date: 2026-01-04 20:15:06
description: 本文将概述 OAuth/SAML 等经典 Web 认证和授权协议，以及它们的现代扩展。
tags: [Review, Web, Protocols]
title: Web 认证和授权协议
updated: 2026-03-17
---

本文介绍的三个协议特点如下：
| 维度         | OAuth 2.0/2.1          | OIDC                    | SAML 2.0           |
| :----------- | :--------------------- | :---------------------- | :----------------- |
| **核心目标** | 授权（Authorization）  | 认证（Authentication）  | 认证 + 授权        |
| **令牌类型** | Access/Refresh Token   | ID Token + Access Token | Assertion (XML)    |
| **适用场景** | API 访问授权           | 用户身份认证            | 企业 SSO           |
| **安全基线** | 强制 PKCE + state      | 强制 PKCE + nonce       | 强制签名 + 加密    |
| **未来趋势** | OAuth 2.1 整合最佳实践 | 与 OAuth 2.1 深度融合   | 存量市场，新增有限 |

## RFC 6749 OAuth 2.0

### OAuth 2.0 总体框架

OAuth 2.0 是一个“授权协议”，用于让客户端在不掌握用户凭证的前提下，受控地访问资源服务器上的资源。

```
 +--------+                               +---------------+
 |        |--(A)- Authorization Request ->|   Resource    |
 |        |                               |     Owner     |
 |        |<-(B)-- Authorization Grant ---|               |
 |        |                               +---------------+
 |        |
 |        |                               +---------------+
 |        |--(C)-- Authorization Grant -->| Authorization |
 | Client |                               |     Server    |
 |        |<-(D)----- Access Token -------|               |
 |        |                               +---------------+
 |        |
 |        |                               +---------------+
 |        |--(E)----- Access Token ------>|    Resource   |
 |        |                               |     Server    |
 |        |<-(F)--- Protected Resource ---|               |
 +--------+                               +---------------+
```

整个过程中的参与方如下：

| 参与方                             | 标准术语                   |
| ---------------------------------- | -------------------------- |
| 资源所有者（用户）                 | Resource Owner             |
| 应用（客户端）                     | Client                     |
| Web 托管的应用资源（多为 JS 文件） | Web-hosted Client Resource |
| 用户代理（多为浏览器）             | User Agent                 |
| 授权服务器                         | Authorization Server       |
| 资源服务器                         | Resource Server            |

整个过程中交互的资源如下：

| 资源       | 标准术语           |
| ---------- | ------------------ |
| 授权码     | Authorization Code |
| 访问令牌   | Access Token       |
| 刷新令牌   | Refresh Token      |
| 重定向 URI | redirection URI    |

其中 Client 可以分为两种：

| 类型                | 特征           | 示例                   |
| ------------------- | -------------- | ---------------------- |
| Confidential Client | 能安全存密码   | 传统 Web Server        |
| Public Client       | 不能安全存密码 | SPA / Mobile / Desktop |

### OAuth 2.0 授权码模式

授权码模式（*Authorization Code Grant*）是 OAuth 2.0 功能最完整、流程最严密的授权模式。它的特点就是通过客户端的后台服务器，与服务提供商的认证服务器进行互动。工作流如下：

1. User Agent 访问 Client 时，后者向 Authorization Server 发送请求并将前者导向 Authorization Server。
2. User Agent 让 Resource Owner 登录 Authorization Server 并决策是否给 Client 授权。
3. 若 Resource Owner 同意授权， Authorization Server 会返回一个 Authorization Code，并将 User-Agent 导向 Client 事先指定的 redirection URI。
4. Client 收到 Authorization Code 后，**在后台** 向 Authorization Server 申请 Access Token。
5. Authorization Server 核对 Authorization Code 和 redirection URI 并向 Client 发送 Access Token。

```
 +----------+
 | Resource |
 |   Owner  |
 |          |
 +----------+
	  ^
	  |
	 (B)
 +----|-----+          Client Identifier      +---------------+
 |         -+----(A)-- & redirection URI ---->|               |
 |  User-   |                                 | Authorization |
 |  Agent  -+----(B)-- User authenticates --->|     Server    |
 |          |                                 |               |
 |         -+----(C)-- Authorization Code ---<|               |
 +-|----|---+                                 +---------------+
   |    |                                         ^      v
  (A)  (C)                                        |      |
   |    |                                         |      |
   ^    v                                         |      |
 +---------+                                      |      |
 |         |>---(D)-- Authorization Code ---------'      |
 |  Client |          & redirection URI                  |
 |         |                                             |
 |         |<---(E)----- Access Token -------------------'
 +---------+       (w/ Optional Refresh Token)

```

第一步中，Client 向 Authorization Server 发送的参数如下：

|     字段      | 是否可选 | 含义                                            |
| :-----------: | :------: | ----------------------------------------------- |
| response_type |   必选   | 指定 OAuth 授权类型，本场景置为定值  `code`     |
|   client_id   |   必选   | 标识 Client（预先在 Authorization Server 注册） |
| redirect_uri  |   可选   | Client 的重定向地址，用于防止 code/token 泄露   |
|     scope     |   可选   | Client 请求的权限，做到最小权限原则             |
|     state     |   可选   | Client 指定的状态码，第三步里会被原样传回       |

```http
GET /authorize?response_type=code&client_id=s6BhdRkqt3&state=xyz
	&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb HTTP/1.1
Host: server.example.com
```

第二步中，OAuth 不关心登录的具体细节。

第三步中，Authorization Server 返回给 User Agent（并最终触发对 Client 的调用）的结构体如下：

| 字段  | 是否可选 | 含义                                  |
| :---: | :------: | ------------------------------------- |
| code  |   必选   | 一次性授权码                          |
| state | 条件必选 | 若 Client 传了 `state` 字段则原样返回 |

```http
HTTP/1.1 302 Found
Location: https://client.example.com/cb?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz  
```

第四步中，Client 向 Authorization Server 发送申请的参数如下。如果是 Public Client，`client_id` 放于参数；如果是 Confidential Client，使用 HTTP Basic 凭据进行 `client_id` + `client_secret` 的认证。

|     字段     | 是否必选 | 说明                                            |
| :----------: | :------: | ----------------------------------------------- |
|  grant_type  |   必选   | OAuth 模式声明，本场景置为 `authorization_code` |
|     code     |   必选   | 一次性授权码                                    |
| redirect_uri | 条件必选 | 重定向 URI，若 Client 最初传了就必须原样传      |
|  client_id   |   可选   | Client 标识                                     |

```http
POST /token HTTP/1.1
Host: server.example.com
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb
```

第五步中，Authorization Server 给 Client 回复的结构体如下:

|     字段      | 是否必选 | 说明                                       |
| :-----------: | :------: | ------------------------------------------ |
| access_token  |   必选   | 访问令牌                                   |
|  token_type   |   必选   | 令牌类型，如 `bearer` 或 `mac`             |
|  expires_in   |   可选   | 过期时间，单位为秒                         |
| refresh_token |   可选   | 刷新令牌，用来获取下一次的访问令牌         |
|     scope     | 条件必选 | 权限范围，若与 Client 申请的范围一致可省略 |

```json
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
    "access_token": "2YotnFZFEjr1zCsicMWpAA",
    "token_type": "example",
    "expires_in": 3600,
    "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA",
    "example_parameter": "example_value"
}
```

`token_type` 的种类和用法交由对应的 RFC 来解释。RFC 6749 里举了两个例子：

+ [RFC 6750](https://datatracker.ietf.org/doc/html/rfc6750  ) Bearer Token：谁持有 token 谁就能使用（需配合 TLS）。这是 OAuth 协议的主流场景。
+ [OAuth-HTTP-MAC](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-http-mac-05  ) **M**essage **A**uthentication **C**ode：客户端和授权服务器共享一个对称密钥。客户端不直接发送 Access Token，而是构造规范化请求字符串并用 MAC 计算出 HMAC，服务端做同样的运算来校验。尽管 MAC 的安全性更高，这个草案最终因为协议复杂性和密钥管理问题被淘汰。

### OAuth 2.0 其他授权模式

除授权码模式外，RFC 6749 还定义了其他三种授权模式：

+ **简化模式**（Implicit Grant）：主要为 Public Client 设计，跳过了"授权码"步骤，无需经过 Client 的后端服务器，全程在 User Agent 上操作。Authorization Server 返回的重定向 URI 里直接带有访问令牌，其被放置在 Path 的 Hash 部分（以 `#` 分隔）。接下来 User Agent 回调 Web-hosted Client Resource 获取某个静态脚本来解析 URI Fragment 里的 Access Token，这个令牌最终交给 Client 使用。
+ **密码模式**（Resource Owner Password Credentials Grant）：Resource Owner 直接向 Client 提供自己的用户名和密码。Client 使用这些信息向 Authorization Server 索要授权。通常用在 Resource Owner 对 Client 高度信任的场景，比如 Client 是操作系统的一部分，或者由一个著名公司出品。
+ **客户端凭证模式**（Client Credentials Grant）：Resource Owner 向 Client 注册，Client 以自己的名义要求 Authorization Server 提供服务（过程中其实不存在授权的说法）。

随着安全实践演进，部分模式已被废弃或不推荐使用。下表整理了各模式的适用场景与安全评价：

|      模式名称      |     典型使用场景     | 是否推荐  | 安全评价                               |
| :----------------: | :------------------: | :-------: | -------------------------------------- |
|   **授权码模式**   | Web 应用、Native App |  ✅ 推荐   | 常配合 PKCE 和 state 使用              |
|    **简化模式**    |      纯前端 SPA      | ❌ 已废弃  | 令牌易被截取，无法判断 Client 是否恶意 |
|    **密码模式**    |  高度可信的 Client   | ❌ 已废弃  | 密码泄露，无法实现最小权限             |
| **客户端凭证模式** |      服务间通信      | ✅特定场景 | 只用于无用户上下文的机机授权           |

### OAuth 2.0 令牌刷新机制

RFC 6749 中的 Refresh Token 用于安全地获取新的 Access Token，避免 Resource Owner 频繁重新登录。这个字段是可选的，由 Authorization Server 在颁发时决定（通常对长期访问场景才颁发）。工作流如下：

```
+--------+                                           +---------------+
|        |--(A)------- Authorization Grant --------->|               |
|        |                                           |               |
|        |<-(B)----------- Access Token -------------|               |
|        |               & Refresh Token             |               |
|        |                                           |               |
|        |                            +----------+   |               |
|        |--(C)---- Access Token ---->|          |   |               |
|        |                            |          |   |               |
|        |<-(D)- Protected Resource --| Resource |   | Authorization |
| Client |                            |  Server  |   |     Server    |
|        |--(E)---- Access Token ---->|          |   |               |
|        |                            |          |   |               |
|        |<-(F)- Invalid Token Error -|          |   |               |
|        |                            +----------+   |               |
|        |                                           |               |
|        |--(G)----------- Refresh Token ----------->|               |
|        |                                           |               |
|        |<-(H)----------- Access Token -------------|               |
+--------+           & Optional Refresh Token        +---------------+
```

倒数第二步中，Client 向 Authorization Server 发送申请的参数如下：

|     字段      | 是否必选 | 说明                                             |
| :-----------: | :------: | ------------------------------------------------ |
|  grant_type   |   必选   | OAuth 模式声明，本场景置为 `refresh_token`       |
| refresh_token |   必选   | 表示早前收到的更新令牌                           |
|     scope     | 条件必选 | 权限范围，不可超出上一次申请的范围，若一致可忽略 |

```http
POST /token HTTP/1.1
Host: server.example.com
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA
```

第二步或最后一步中，Authorization Server 给 Client 返回的结构体和先前保持一致。

## OAuth 最佳实践

### Login CSRF 攻击和 state 校验

跨站伪造请求攻击（**C**ross-**S**ite **R**equest **F**orgery Attack）：攻击者诱导已登录用户的浏览器，在用户不知情的情况下，向目标网站发起一个“伪造但合法”的请求（如转账、改密码、发邮件）。

> 标准 CSRF 的触发条件：用户已通过 Cookie 认证登录了目标网站。

登录跨站伪造请求攻击（Login CSRF Attack）：攻击者在用户不知情的情况下让其登录到攻击者控制的账户。

> Login CSRF 在 OAuth2.0 场景的触发条件：OAuth 流程里省略 state 参数。

Login CSRF 攻击流程：攻击者可以自己先走一遍 OAuth 前三步流程拿到一个有效的授权码，再构造 OAuth 第四步里原本由用户 Client 构造的请求，诱导用户的 User Agent 将其发送给 Authorization Server。

Login CSRF 防护方式：OAuth 流程里强制传入 `state` 参数，Client 收到回调地址后校验这个会话的 `state`。

### 授权码拦截攻击和 PKCE

授权码拦截攻击（*Authorization Code Interception Attack*）：攻击者在用户设备上通过恶意应用或系统漏洞，窃听或劫持 OAuth 2.0 授权流程中的回调 URI 从而截获授权码，并在合法客户端完成令牌交换前抢先使用该授权码向授权服务器兑换访问令牌，从而冒充用户访问受保护资源。

> 授权码拦截攻击在 OAuth2.0 场景的触发条件：Public Client（无法用 client_secret）且授权码可劫持。 

**[RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636) Proof Key for Code Exchange by OAuth Public Clients**：提出了授权码交换证明密钥（**P**roof **K**ey for **C**ode **E**xchange），使得即使 Authorization Code 被截获，攻击者也无法用它换出 Access Token，因为他们不知道一个只有合法客户端才知道的“动态密钥”。PKCE 的具体流程如下：

1. Client 为本次会话生成 `code_verifier` 和 `code_challenge` 两个字段，前者是 43-128 字节的高熵随机字符串，后者是前者的哈希，例如 `code_challenge=BASE64URL-ENCODE(SHA256(code_verifier))`。
2. 第一步 Client 向 Authorization Server 发起授权请求时，额外带上 `code_challenge` 字段。
3. 第四步 Client 向 Authorization Server 发起授权码换令牌时，必须提供原始的 `code_code_verifier` 字段。

目前 RFC 7636 已被广泛采用，Google、Apple、Microsoft 等平台要求 Native App 必须使用 PKCE，而 Auth0、Okta 等平台甚至强制所有 Client（无论是否是 Public Client）使用 PKCE。 

### 改进 Bearer Token

为了解决 Bearer Token 的安全缺陷，OAuth 社区提出的两种持有证明（**P**roof **o**f **P**ossession）模型。

**[RFC 8471](https://datatracker.ietf.org/doc/html/rfc8471) The Token Binding Protocol Version 1.0**：将 Access Token 与 TLS 层的客户端密钥绑定。泄露后由于攻击者没有对应的私钥，就无法在 TLS 握手时完成身份证明。**注意这个 RFC 已被弃用（historic）**：其理念没有问题，但底层所依赖的 Token Binding 协议（RFC 8472/8473）未能获得广泛支持和实现。

**[RFC 9449](https://datatracker.ietf.org/doc/html/rfc9449) OAuth 2.0 Demonstrating Proof-of-Possession**：不依赖 TLS 客户端证书，而是通过应用层机制实现，**是推荐的 PoP 实现方式**。Client 自身持有一个私钥（通常非对称密钥对），公钥注册在 Authorization Server 上，Access Token 会内嵌该公钥的信息。Client 每次向 Resource Server 发起请求时，会用 Client 的私钥对本次规范化请求做签名来生成 JWT，这被称为 **DPoP Proof**。请求头里会同时带上 `Authorization: Bearer <access_token>` 和 `DPoP: <DPoP Proof JWT>`。

### 授权服务器元数据

在现代 OAuth 2.0 的生态系统中，客户端与授权服务器的集成往往需要预先配置大量信息，例如授权端点、令牌端点、支持的授权类型等。这种硬编码的配置方式不仅繁琐，而且缺乏灵活性，阻碍了动态发现和互操作性。

**[RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414)** **OAuth 2.0 Authorization Server Metadata**：定义了标准的元数据文档格式（通常位于 `/.well-known/oauth-authorization-server`），使得客户端能够自动发现授权服务器的能力。该规范是 **OAuth 2.0 生态系统共享** 的核心发现机制，不仅被 OIDC 采用，也被所有遵循现代 OAuth 安全最佳实践的授权服务器所支持。这个机制为动态客户端注册（Dynamic Client Registration）等高级功能奠定了基础。

该元数据文档的核心是一个 JSON 对象，其中包含了一系列标准化的键值对。一些关键的元数据字段包括：

| 字段                                    | 说明                                                         |
| :-------------------------------------- | :----------------------------------------------------------- |
| `issuer`                                | 授权服务器的唯一标识符（Issuer Identifier），通常是一个 HTTPS URL。这是验证 JWT 令牌（如 ID Token 或自包含访问令牌）签名的关键。 |
| `authorization_endpoint`                | 授权端点的 URL。                                             |
| `token_endpoint`                        | 令牌端点的 URL。                                             |
| `jwks_uri`                              | 用于获取授权服务器公钥的 JWK Set 文档的 URL，客户端用它来验证 JWT 签名。 |
| `response_types_supported`              | 授权服务器支持的 `response_type` 值列表。                    |
| `grant_types_supported`                 | 授权服务器支持的授权类型（Grant Type）列表（如 `authorization_code`, `refresh_token`）。 |
| `token_endpoint_auth_methods_supported` | 令牌端点支持的客户端认证方法列表                             |
| `scopes_supported`                      | （可选）授权服务器支持的 `scope` 值列表。                    |
| `code_challenge_methods_supported`      | （可选）授权服务器支持的 PKCE Code Challenge 方法。          |

一个典型的元数据文档响应如下：

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "issuer": "https://as.example.com",
  "authorization_endpoint": "https://as.example.com/authorize",
  "token_endpoint": "https://as.example.com/token",
  "jwks_uri": "https://as.example.com/jwks",
  "response_types_supported": ["code", "code id_token"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "token_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "private_key_jwt"
  ],
  "scopes_supported": ["openid", "profile", "email"],
  "code_challenge_methods_supported": ["S256"]
}
```

### 其他 RFC 最佳实践和 OAuth2.1 草案

**[RFC 6819](https://datatracker.ietf.org/doc/html/rfc6819) OAuth 2.0 Threat Model  and Security Considerations**：系统性地列举了 OAuth 2.0 协议在各种部署场景下可能面临的威胁模型，明确哪些设计是“危险的”（例如简化模式导致 Access Token 暴露，未检验 redirect URI 使得攻击者可以重定向至恶意端点，未将授权请求与响应绑定导致 CSRF 或授权码注入攻击等），并为每类威胁提供了“安全考虑”，成为后续 RFC 9700 Best Current Practice 的重要基础。

**[RFC 8252](https://datatracker.ietf.org/doc/html/rfc8252) OAuth 2.0 for Native Apps**：对于 Mobile / Desktop 这种 Public Client 场景，明确禁止使用简化模式（因其返回 Access Token 到前端 URI，易被窃取），强制要求 Authorization Code Flow + PKCE，要求必须精确匹配 redirect URI（仅 Loopback IP 允许端口变化），同时规范了 redirect URI 的三种合法形式：

1. 自定义 URI scheme（如 `com.example.app:/callback`），需采用反向域名以降低冲突风险。
2. Loopback IP 地址（127.0.0.1 或 ::1）配合临时端口，适用于桌面或支持本地监听的移动平台。
3. 通过 Android App Links 或 iOS Universal Links 实现的已声明的 HTTPS URI，由操作系统验证应用所有权。

**[RFC 8628](https://datatracker.ietf.org/doc/html/rfc8628) OAuth 2.0 Device Authorization Grant**：为无浏览器或输入受限的客户端（如智能电视、打印机、IoT 设备）设计的授权流程。用户在另一台设备（如手机）上访问授权 URL 并输入用户码，授权服务器在后台轮询确认用户是否完成授权，成功后返回访问令牌。避免了在受限设备上直接处理浏览器重定向的困难。

**[RFC 8705](https://datatracker.ietf.org/doc/html/rfc8705) OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens**：定义了两种安全机制：1. 客户端使用 mTLS 来替代 `client_secret` 向 Authorization Server 证明身份；2. 将访问令牌绑定到客户端证书（certificate-bound tokens）。即使令牌被窃取，攻击者也无法在无证书的情况下使用，实现令牌的发送方约束（sender-constraining）。适用于高安全要求的机密客户端（如微服务间通信）。

**[RFC 9101](https://datatracker.ietf.org/doc/html/rfc9101) JWT Secured Authorization Request**：允许客户端将授权请求参数封装在一个经过签名和/或加密的 JWT 中，以 `request`（或 `request_uri`）参数的形式提交，保证授权请求的完整性与机密性。

**[RFC 9126](https://datatracker.ietf.org/doc/html/rfc9126) Pushed Authorization Requests**：传统授权请求通过重定向 URI 的 query 参数传递，易受参数注入、请求对象篡改或日志泄露影响。PAR 要求客户端先通过安全后端通道（如 POST 到 Authorization Server）提交授权请求参数，Authorization Server 返回一个 request URI，客户端再用该 URI 发起授权请求。

**[RFC 9700](https://datatracker.ietf.org/doc/rfc9700/) Best Current Practice for OAuth 2.0 Security**：更新并扩展了早期 RFC（6749/6750/6819）中的威胁模型和安全建议，为现有 OAuth 2.0 实现提供一份权威、与时俱进的安全指南。

**[IETF Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps/) OAuth 2.0 for Browser-Based Apps**：草案指出，纯前端应用不应再使用已废弃的 Implicit Flow，而是采用 Authorization Code Flow + PKCE 模式，同时提供三种安全架构方案：

1. 前端 Token 存储：将 token 存于内存或严格限制的 HTTP-only、SameSite=Strict/Secure 的 Cookie 中，搭配短期令牌、严格的 CORS 策略、Content Security Policy (CSP) 以及定期检查 XSS 漏洞。
2. **B**ackend-**f**or-**F**rontend 模式：前端只与自己的后端 BFF 通信，BFF 负责 OAuth 2.1 完整流程和敏感凭证。令牌通过安全会话 Cookie (SameSite=Strict/Lax) 从浏览器传到 BFF，BFF 再用它获取 Access Token。这样令牌永远不会暴露给浏览器 JavaScript 上下文，有效防御 XSS 威胁。
3. Token Binding 增强：结合 RFC 9449 DPoP 技术将 Access Token 绑定到应用实例生成的非对称密钥对上。即使 XSS 攻击者窃取了令牌，没有对应的私钥也无法生成有效的 DPoP Proofs，大大降低令牌泄露风险。

**[IETF Draft](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/) OAuth 2.1**：OAuth 2.1 草案（目前是 2025-10-19 的 v2-1-14 版本）系统性地整合了过去十年最佳安全实践，吸收了 RFC 6749/6750/7636/8252/9700 等规范，形成更安全、更清晰的授权框架。

- 只保留授权码模式和机机场景的客户端凭证模式，完全移除 OAuth2.0 的简化模式和密码模式。
- 强制在所有客户端（包括 Confidential 和 Public）在授权码模式中使用 PKCE。
- 强制使用 `state` 参数（或等效机制如 PKCE/nonce），防御 CSRF 和跨域注入攻击。
- 强制 Redirect URI 精确匹配，且禁止在 URI 查询参数中传输访问令牌。
- 强制刷新令牌绑定客户端，强烈推荐实现刷新令牌轮换（*Refresh Token rotation*）。
- 推荐使用 RFC 8414 OAuth 2.0 Authorization Server Metadata 实现客户端自动发现。
- 推荐使用 RFC 9068 JWT Profile for OAuth 2.0 Access Tokens 实现自包含与可验证性。
- 推荐对访问令牌实施发送方约束：浏览器应用使用 RFC 9449 DPoP，服务端通信使用 RFC 8705 mTLS。
- 推荐使用 RFC 9126 PAR 保护授权请求，复杂授权场景可结合 RFC 9101 JAR。

## OIDC

### OIDC 总体框架

**O**pen**ID** **C**onnect 规范并不来源于 RFC，而是由 OpenID 组织在 [openid.net](https://openid.net/specs/openid-connect-core-1_0.html) 里定义的规范。2025 年 5 月，OpenID Connect Core 1.0 正式被 ITU-T 采纳为国际标准（ITU-T **X.1285**）。

OIDC 是建立在 OAuth 2.0 协议之上的一个**身份认证协议**（Authentication Protocol）。它巧妙地复用了 OAuth 2.0 的授权流程，但核心目标从“授权”（Authorization）转变为“认证”（Authentication）。

```
+--------+                                   +--------+
|        |----(1) Authentication Request---->|        |
|        |        (scope=openid & nonce)     |        |
| Relying|                                   | OpenID |
| Party  |      +-------------------+        | Provider
| (RP)   |      |     End-User      |        | (OP)   |
|        |      |<--(2) AuthN & AuthZ------> |        |
|        |      +-------------------+        |        |
|        |<---(3) Authentication Response----|        |
|        |      (ID Token & Access Token)    |        |
+--------+                                   +--------+
```

在整个 OIDC 流程中，参与方的角色在 OAuth 2.0 的基础上有了新的命名：

| 参与方     | OAuth 2.0 术语       | OIDC 术语               | 说明                       |
| :--------- | :------------------- | :---------------------- | :------------------------- |
| 用户       | Resource Owner       | End-User                | 被认证的主体               |
| 应用       | Client               | **R**elying **P**arty   | 依赖方，验证用户身份的应用 |
| 授权服务器 | Authorization Server | **O**penID **P**rovider | 身份提供者，颁发 ID Token  |

整个过程中交互的核心资源：

| 资源             | 标准术语              | 说明                                                |
| :--------------- | :-------------------- | :-------------------------------------------------- |
| 访问令牌         | Access Token          | 同 OAuth 2.0，用于访问用户信息等受保护资源          |
| **身份令牌**     | **ID Token**          | 核心新增：包含用户身份声明的 JWT                |
| **用户信息接口** | **UserInfo Endpoint** | 一个受保护的资源端点，RP 可用来获取更详细的用户信息 |

### ID Token

ID Token 是一个由 OpenID Provider 签名的 **J**SON **W**eb **T**oken。Relying Party 通过验证其签名并校验字段内容（*Claims*）确认身份有效性。关键字段如下：

| 字段        | 是否必选 | 含义                                                         |
| :---------- | :------- | :----------------------------------------------------------- |
| `iss`       | 必选     | 签发者（*Issuer*）的唯一标识符 URL，需匹配元数据中的 issuer。 |
| `sub`       | 必选     | 用户在当前 OpenID Provider 下的唯一标识符（*Subject*）       |
| `aud`       | 必选     | 受众（*Audience*），即预期接受者，必须包含 Relying Party 的 `client_id`。 |
| `exp`/`iat` | 必选     | 过期时间（*Expiration Time*） / 签发时间（*Issued At*），Unix 时间戳。 |
| `nonce`     | 条件必选 | 安全核心：如果 Relying Party 在授权请求中发送了 `nonce`，则 ID Token 中必须包含相同的值，用于防范重放攻击。 |
| `at_hash`   | 条件     | Access Token 哈希，防止被篡改/替换。                         |

一个典型的 ID Token Payload 例子：

```json
{
	"iss": "https://server.example.com",
	"sub": "248289761001",
	"aud": "s6BhdRkqt3",
	"nonce": "n-0S6_WzA2Mj",
	"at_hash": "jH_D0X_vHOfSMMI09V7Vkw",
	"exp": 1311281970,
	"iat": 1311280970,
	"email": "user@example.com"
}
```

### OIDC 授权流程

#### 授权码模式

OIDC 最常用的依然是**授权码模式**，其步骤与 OAuth 2.0 基本一致，但在参数和返回结果上有扩展。

1. Relying Party 将 End-User 的 User Agent 导向 OpenID Provider 授权端点，请求中新增 `scope=openid`。
2. OpenID Provider 对 End-User 进行身份验证，并征得其同意，允许 Relying Party 获取其身份信息。
3. OpenID Provider 通过重定向 URI 将授权码返回给 Relying Party。
4. Relying Party 在后台使用授权码向 OpenID Provider 的令牌端点请求令牌。
5. OpenID Provider 验证授权码后，向 Relying Party 返回一个包含 **ID Token** 和 **Access Token** 的响应。ID Token 中必须包含与请求中相同的 `nonce` 值，以防范重放攻击。

第一步 Relying Party 发起授权请求时， `scope` 内容必须包含 `openid`，且强烈建议带上 `nonce`。

| 常见新增字段 | 是否必选 | 含义                                                         |
| :----------- | :------: | :----------------------------------------------------------- |
| scope        |   必选   | 必须包含 `openid`，可扩展 `profile` `email` 等               |
| nonce        |   推荐   | 随机字符串，用于防范重放攻击，ID Token 中原样返回            |
| prompt       |   可选   | 控制认证行为，如 `none` `login` `consent` `select_account`   |
| display      |   可选   | 控制 OpenID Provider 展示界面，如 `page` `popup` `touch` `wap` |

```http
GET /authorize?response_type=code&scope=openid%20profile%20email
    &client_id=s6BhdRkqt3&state=af0ifjsldkj&nonce=n-0S6_WzA2Mj
    &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb HTTP/1.1
Host: server.example.com
```

第五步 OpenID Provider 返回令牌相应时，在 Access Token 的基础上新增 ID Token。

```json
{
    "access_token": "2YotnFZFEjr1zCsicMWpAA",
    "token_type":" example",
    "expires_in": 3600,
    "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA",
    "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWJkZ..."
}
```

Relying Party 可以用 Access Token 向 UserInfo 接口发起请求，以获取更多用户属性。

```http
GET /userinfo HTTP/1.1
Host: server.example.com
Authorization: Bearer 2YotnFZFEjr1zCsicMWpAA
```

#### 简化模式

同 OAuth2.0 的概念，专为无法安全持有客户端密钥的纯前端应用（如单页应用 SPA）设计，包含两种变体：

| response_type    | 含义                       |
| :--------------- | :------------------------- |
| `id_token`       | 纯身份认证场景             |
| `id_token token` | 同时需要 Access Token 场景 |

评价：由于令牌直接暴露在浏览器的 URI 中，可能被历史记录、日志或第三方脚本窃取，**该模式已被 OIDC 官方弃用**。现代 SPA 应采用 **授权码模式 + PKCE** 来兼顾安全性和功能性。

#### 混合模式

混合模式是授权码模式和简化模式的结合体，旨在提供更灵活的选项。它允许 Relying Party 在前端重定向时立即获得 ID Token（用于快速认证），同时在后端安全地获取 Access Token（用于调用 API）。混合模式通过组合 `code`、`id_token` 和 `token` 来定义 `response_type`，常见的组合有：

| response_type         | 含义                                             |
| :-------------------- | :----------------------------------------------- |
| `code id_token`       | 前端获得 ID Token，后端用授权码换取 Access Token |
| `code token`          | 前端获得 Access Token，后端用授权码换取刷新令牌  |
| `code id_token token` | 前端同时获得 ID Token 和 Access Token            |

评价：混合模式的安全性介于授权码模式和简化模式之间。虽然 ID Token 在前端暴露，但最关键的 Access Token 仍然是通过后端安全通道获取的。然而，随着 PKCE 的普及和 BFF（Backend-for-Frontend）架构的成熟，混合模式的必要性已大大降低，通常不再作为首选方案。

### OIDC 规范和安全实践

**[OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html)**：定义了标准的元数据文档格式（通常位于 `/.well-known/openid-configuration`），使得客户端能够自动发现 OpenID Provider 的能力。该机制是 **RFC 8414 OAuth 2.0 Authorization Server Metadata** 的超集，额外包含 OIDC 特定的端点和能力声明。

| 字段                                    | 说明                                        |
| :-------------------------------------- | :------------------------------------------ |
| `issuer`                                | OP 的唯一标识符 URL                         |
| `authorization_endpoint`                | 授权端点 URL                                |
| `token_endpoint`                        | 令牌端点 URL                                |
| `userinfo_endpoint`                     | UserInfo 接口 URL                           |
| `jwks_uri`                              | 公钥 JWK Set 文档 URL                       |
| `id_token_signing_alg_values_supported` | 支持的 ID Token 签名算法列表                |
| `subject_types_supported`               | 支持的 `sub` 类型（`public` 或 `pairwise`） |
| `acr_values_supported`                  | 支持的认证上下文参考值列表                  |

一个典型的发现文档响应：

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
	"issuer": "https://server.example.com",
	"authorization_endpoint": "https://server.example.com/authorize",
	"token_endpoint": "https://server.example.com/token",
	"userinfo_endpoint": "https://server.example.com/userinfo",
	"jwks_uri": "https://server.example.com/jwks",
	"id_token_signing_alg_values_supported": ["RS256", "ES256"],
	"subject_types_supported": ["public", "pairwise"],
	"response_types_supported": ["code", "code id_token", "id_token"],
	"grant_types_supported": ["authorization_code", "refresh_token"]
}
```

**[OpenID Connect Session Management 1.0](https://openid.net/specs/openid-connect-session-1_0.html)**：定义了 Relying Party 与 OpenID Provider 之间的会话状态同步机制，支持单点登录（SSO）和单点登出（SLO）。核心机制包括：

| 机制                     | 说明                                                         |
| :----------------------- | :----------------------------------------------------------- |
| **Check Session IFrame** | OpenID Provider 提供的隐藏 iframe，Relying Party 通过 `postMessage` 轮询会话状态 |
| **Session State**        | 会话状态标识符，在授权响应中返回，用于检测会话变化           |
| **Logout Token**         | 用于后端通道登出通知的 JWT，包含 `sid`（会话 ID）和 `events` 声明 |

**[OpenID Connect Front-Channel Logout 1.0](https://openid.net/specs/openid-connect-frontchannel-1_0.html)**：前端通道登出。通过浏览器重定向实现跨 Relying Party 的登出通知，适用于同域或可信域场景。

**[OpenID Connect Back-Channel Logout 1.0](https://openid.net/specs/openid-connect-backchannel-1_0.html)**：后端通道登出。通过服务端到服务端的 HTTP POST 推送 Logout Token，更安全且支持跨域场景。

**[OpenID Connect Authentication Context Class Reference](https://openid.net/specs/openid-connect-authn-context-1_0.html)**：认证级别声明。定义了 `acr`（Authentication Context Class Reference）和 `amr`（Authentication Method References）声明。Relying Party 可在授权请求中通过 `acr_values` 参数要求特定的认证级别，OpenID Provider 在 ID Token 中返回实际达成的 `acr` 值。

| 声明  | 说明               | 示例值                                 |
| :---- | :----------------- | :------------------------------------- |
| `acr` | 认证上下文类别引用 | `0`（低）`1`（中）`2`（高）`3`（很高） |
| `amr` | 认证方法引用数组   | `["pwd", "mfa", "hwk"]`                |

```http
GET /authorize?response_type=code&scope=openid
    &acr_values=urn:openid:assurance:LOA3&client_id=s6BhdRkqt3
    &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb HTTP/1.1
```

推荐的安全实践如下：

| 安全要点          | 安全建议          | 说明                                                    |
| :---------------- | :---------------- | :------------------------------------------------------ |
| ID Token 签名算法 | `RS256` / `ES256` | 避免使用 `none` 或对称算法                              |
| ID Token 有效期   | ≤ 1 小时          | 缩短令牌生命周期                                        |
| nonce             | 使用该字段        | 每次授权请求生成新的高熵随机字符串                      |
| at_hash           | 使用该字段        | OpenID Provider 提供 Access Token 签名来绑定 ID Token。 |
| PKCE              | 使用该字段        | 所有客户端类型均应采用                                  |
| Redirect URI      | 精确匹配          | 禁止通配符，禁止查询参数                                |
| UserInfo 请求     | 使用 Access Token | 避免在 ID Token 中暴露过多敏感信息                      |

## SAML

### SAML 总体框架

SAML（**S**ecurity **A**ssertion **M**arkup **L**anguage）是一个基于 XML 的开放标准，用于在身份提供者（IdP）和服务提供者（SP）之间交换认证和授权数据。**SAML 2.0** 在 2005 年发布，其核心定义在 OASIS 的 *Assertions and Protocols* 规范中。尽管已有 20 多年历史，SAML 仍然是企业级单点登录（SSO）和身份联邦的事实标准。

```
+--------+                                   +--------+
|        |                                   |        |
|        |---------(1) AuthnRequest--------->|        |
|        |                                   |        |
|        |  +--------+                       |        |
|        |  |        |                       |        |
|   SP   |  |  End   |<--(2) Authenticate--->|   IdP  |
|        |  |  User  |                       |        |
|        |  |        |                       |        |
|        |  +--------+                       |        |
|        |                                   |        |
|        |<--------(3) SAML Response---------|        |
|        |      (w/ Assertion)               |        |
+--------+                                   +--------+
```

在整个 SAML 流程中，参与方的角色定义如下：

| 参与方     | SAML 术语                 | 说明                                     |
| :--------- | :------------------------ | :--------------------------------------- |
| 用户       | Principal / End-User      | 被认证的主体                             |
| 应用       | **S**ervice **P**rovider  | 服务提供者，即需要验证用户身份的应用     |
| 授权服务器 | **Id**entity **P**rovider | 身份提供者，负责认证用户并颁发 Assertion |

整个过程中交互的核心资源如下：

| 资源         | 标准术语                               | 说明                                                     |
| :----------- | :------------------------------------- | :------------------------------------------------------- |
| 认证请求     | AuthnRequest                           | SP 向 IdP 发起的认证请求                                 |
| 认证响应     | SAML Response                          | IdP 返回的响应，包含一个或多个 Assertion                 |
| **断言**     | **Assertion**                          | SAML 2.0 新增的核心，是一个 XML 文档，包含用户的身份声明 |
| 断言消费服务 | **A**ssertion **C**onsumer **S**ervice | SP 接收 SAML Response 的端点                             |
| 单点登录服务 | **S**ingle **S**ign-**O**n Service     | IdP 处理认证请求的端点                                   |
| 元数据       | Metadata                               | 描述 IdP/SP 配置的 XML 文档（端点、证书等）              |

### SAML 2.0 交互流程

SAML 2.0 最常见的流程是 SP-Initiated SSO，即由应用方 Service Provider 发起。

```
+--------+      +--------+      +--------+
|  User  |      |   SP   |      |  IdP   |
+---+----+      +---+----+      +---+----+
    |               |               |
    |  (1) Access   |               |
    |  Resource     |               |
    |-------------->|               |
    |               |               |
    |  (2) 302 Redirect (AuthnRequest)
    |<--------------|               |
    |               |               |
    |  (3) POST AuthnRequest        |
    |------------------------------>|
    |               |               |
    |               |  (4) Authenticate User
    |               |<------------->|
    |               |               |
    |  (5) POST SAML Response       |
    |<------------------------------|
    |               |               |
    |  (6) Validate & Create Session
    |               |               |
    |  (7) 302 Redirect to Resource
    |<--------------|               |
    |               |               |
```

流程步骤：

1. 用户尝试访问 Service Provider 上的受保护资源。
2. Service Provider 生成 SAML Request（AuthnRequest），将用户导向 IdP 的 SSO 端点。
3. 用户浏览器将 AuthnRequest 提交到 Identity Provider。
4. Identity Provider 对用户进行身份验证。
5. Identity Provider 生成包含 Assertion 的 SAML Response，发送回 Service Provider 的 ACS 端点。
6. Service Provider 验证签名、条件、受众等，创建本地会话。
7. Service Provider 重定向用户到原始请求的资源。

SAML Binding 定义了 SAML 协议消息如何映射到具体的通信协议。

| Binding 类型      | 传输方式               | 消息方向 | 编码方式                      | 典型用途      |
| :---------------- | :--------------------- | :------- | :---------------------------- | :------------ |
| **HTTP-Redirect** | HTTP 302 重定向        | SP → IdP | DEFLATE + Base64 + URL 编码   | AuthnRequest  |
| **HTTP-POST**     | HTML 表单自动提交      | IdP → SP | Base64（不压缩）              | SAML Response |
| **HTTP-Artifact** | 重定向 + SOAP 后端通道 | 双向     | Artifact（44 字节句柄）+ SOAP | 高安全场景    |

### SAML 结构

#### SAML Assertion

SAML Assertion 是一个由 IdP 签名的 XML 文档，直接传递了关于 Principal 的认证信息。

通过验证 Assertion 的签名（确保其来自可信的 IdP）并检查其条件（如 `NotBefore`, `NotOnOrAfter`, `Audience`），SP 就可以安全地确认 Principal 的身份。

| 元素                     | 是否必选 | 含义                                                         |
| :----------------------- | :------- | :----------------------------------------------------------- |
| `<Issuer>`               | 必选     | 签发 Assertion 的 IdP 的唯一标识符                           |
| `<Signature>`            | 必选     | XML 数字签名，确保完整性和真实性                             |
| `<Subject>` / `<NameID>` | 必选     | 用户的主要标识符，支持多种格式（email、persistent、transient） |
| `<Conditions>`           | 必选     | 指定 Assertion 有效的规则（时间窗口、受众限制）              |
| `<AuthnStatement>`       | 必选     | 描述用户如何及何时在 IdP 处认证                              |
| `<AttributeStatement>`   | 可选     | 包含用户的额外属性信息（如邮箱、部门、角色）                 |

简化后的示例如下：

```xml
<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                ID="_a8b9c0d1e2f3" Version="2.0"
                IssueInstant="2026-03-17T10:00:00Z">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <ds:Signature>...</ds:Signature>
  <saml:Subject>
    <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
      user@example.com
    </saml:NameID>
  </saml:Subject>
  <saml:Conditions NotBefore="2026-03-17T09:55:00Z"
                   NotOnOrAfter="2026-03-17T10:05:00Z">
    <saml:AudienceRestriction>
      <saml:Audience>https://sp.example.com</saml:Audience>
    </saml:AudienceRestriction>
  </saml:Conditions>
  <saml:AuthnStatement AuthnInstant="2026-03-17T09:58:00Z">
    <saml:AuthnContext>
      <saml:AuthnContextClassRef>
        urn:oasis:names:tc:SAML:2.0:ac:classes:Password
      </saml:AuthnContextClassRef>
    </saml:AuthnContext>
  </saml:AuthnStatement>
</saml:Assertion>
```

#### SAML NameID 格式

SAML 支持多种 NameID 格式，以满足不同的隐私和持久性需求：

| 格式 URN                                | 说明                   | 使用场景     |
| :-------------------------------------- | :--------------------- | :----------- |
| `urn:...:nameid-format:emailAddress`    | 用户的电子邮件地址     | 通用场景     |
| `urn:...:nameid-format:persistent`      | 持久的、不透明的标识符 | 长期账户关联 |
| `urn:...:nameid-format:transient`       | 临时的、会话级的标识符 | 隐私敏感场景 |
| `urn:...:nameid-format:kerberos`        | Kerberos principal     | 企业内网     |
| `urn:...:nameid-format:x509SubjectName` | X.509 证书主题         | 证书认证     |

#### SAML Metadata

Metadata 是一个 XML 文档，描述了 IdP 或 SP 的配置信息，包括端点、证书、支持的绑定等。元数据交换是建立 SAML 信任关系的基础。

| 字段                               | 说明                                       |
| :--------------------------------- | :----------------------------------------- |
| `entityID`                         | IdP 或 SP 的唯一标识符（通常是 HTTPS URL） |
| `KeyDescriptor[@use='signing']`    | 用于验证签名的公钥证书                     |
| `KeyDescriptor[@use='encryption']` | 用于加密的公钥证书                         |
| `SingleSignOnService`              | IdP 的 SSO 端点（支持多种 Binding）        |
| `AssertionConsumerService`         | SP 的 ACS 端点（支持多个，可指定默认）     |

Identity Provider 的 Metadata 示例如下：

```xml
<EntityDescriptor entityID="https://idp.example.com">
  <IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <ds:X509Data>
        <ds:X509Certificate>MIIC+zCCAmOgAwIBAgIJ...</ds:X509Certificate>
      </ds:X509Data>
    </KeyDescriptor>
    <SingleSignOnService
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="https://idp.example.com/SAML2/SSO/POST" />
  </IDPSSODescriptor>
</EntityDescriptor>
```

Service Provider 的 Metadata 示例如下：

```xml
<EntityDescriptor entityID="https://sp.example.com">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <ds:X509Data>
        <ds:X509Certificate>MIID...<ds:X509Certificate>
      </ds:X509Data>
    </KeyDescriptor>
    <AssertionConsumerService
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="https://sp.example.com/SAML2/ACS"
        index="1" isDefault="true" />
  </SPSSODescriptor>
</EntityDescriptor>
```

### SAML 安全最佳实践

签名和加密机制：

| 安全机制      | 推荐配置                       | 说明                                         |
| :------------ | :----------------------------- | :------------------------------------------- |
| 请求签名      | ✅ 强制                         | 防止伪造认证请求                             |
| 响应签名      | ✅ 强制                         | 确保响应完整性和真实性                       |
| 断言签名      | ✅ 强制                         | 即使 Response 已签名，Assertion 也应单独签名 |
| 响应/断言加密 | ✅ 推荐（包含敏感属性时）       | 保护 PII 数据                                |
| 签名算法      | RSA-SHA256 / ECDSA-P256-SHA256 | ❌ 避免使用 SHA-1                             |
| 加密算法      | AES-256-GCM / RSA-OAEP         | ❌ 避免使用 DES、3DES、RC4                    |

 SAML 常见威胁和防护手段：

| 威胁类型         | 触发条件                       | 防护方案                                  |
| :--------------- | :----------------------------- | :---------------------------------------- |
| **断言重放攻击** | 未校验 `Assertion ID` 唯一性   | 维护已使用 ID 列表，设置合理时间窗口      |
| **断言注入攻击** | 未验证 `Audience` 或 `Issuer`  | 严格校验受众限制和签发者标识              |
| **签名绕过攻击** | 未验证签名或接受弱算法         | 强制签名验证，禁用 SHA-1/MD5              |
| **会话固定攻击** | 未绑定 SAML 会话与本地会话     | 生成新会话 ID，不直接使用 NameID 作为会话 |
| **XSS 断言泄露** | Assertion 在客户端可被脚本访问 | 使用 HTTP-POST Binding，避免 URL 传输     |
