# Installation Procedure

## Preface

Our repository is an entire serverless web application that is compiled using npm, with nodeJS APIs. The website is served using Cloudflare pages, which allows functional, non-static portions of the website to run as either Cloudflare Workers, Cloudflare KV (key-value store), or Cloudflare D1 (SQL Database).

### Preliminary Steps

- Create a Cloudflare account.

```
https://dash.cloudflare.com/sign-up
```

- Naviate to Cloudflare Pages underneath the "**Workers & Pages**" tab.

```
https://dash.cloudflare.com/<account-id>/workers-and-pages/create/pages
```

- Connect to Git and Select this Repository.

```
Tip: Since you do not have access to this repo as a collaborator,
      instead you can fork this repository and connect Cloudflare to your fork.
Cloudflare is a GitHub plugin, so it needs access permissions.
```

- Choose a subdomain for your production build on **pages.dev**.

```
<sub-domain>.pages.dev
```

- Choose the Production branch to be the "**master**" branch. This is where our production code is located.

- **Skip** the other presets since the Build needs more than that, so "Save and Deploy" to a failing build until Cloudflare allows your detailed config in the next step.

## Cloudflare D1 (Database) Setup

### Preliminary Steps

- Navigate to "**D1**" underneath the "**Workers & Pages**" tab.

```
https://dash.cloudflare.com/<accound-id>/workers/d1
```

### Create a Cloudflare D1 database called "coolfrog-forum".

- Navigate to the database console.

```
https://dash.cloudflare.com/<account-id>/workers/d1/databases/<database-id>/console
```

- Run the following SQL to setup the tables:

```sql
CREATE TABLE topics
(
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    username TEXT NOT NULL,
    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts
(
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    post_date TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE
);
```

### Create a Cloudflare D1 database called "coolfrog-goals".

- Run the following SQL to setup the tables:

```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    UNIQUE(name, username)
);

CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    category_id INTEGER,
    priority_level INTEGER CHECK(priority_level BETWEEN 1 AND 4),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
    username TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

### Create a Cloudflare D1 database called "coolfrog-challenges".

- Run the following SQL to setup the tables:

```sql
CREATE TABLE topics
(
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    username TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts
(
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE
);
```

## Cloudflare KV (key-value) Setup

### Preliminary Steps

- Navigate to "**KV**" underneath the "**Workers & Pages**" tab.

```
https://dash.cloudflare.com/<accound-id>/workers/kv/namespaces
```

### Create the following KV namespaces:

```
coolfrog.emails
coolfrog.sessions
coolfrog.users
coolfrog.leaderboard
```

## Cloudflare Pages Setup

- Navigate to the **Settings** tab of your Pages website and click on "**Builds & deployments**".

```
https://dash.cloudflare.com/<account-id>/pages/view/<sub-domain>/settings/builds-deployments
```

- Set the **Build command**:

```
npm run
```

- Set the **Build system version**:

```
2 (latest)
```

- Navigate to the **Functions** tab on the side bar.

- Set the **Compatibility date**:

```
2024-04-13
```

- Set the **Compatibility flags**:

```
nodejs_compat
```

- Set the following **KV namespace bindings**:

```
Variable name		KV namespace
--------------------------------------------
COOLFROG_EMAILS		coolfrog.emails
COOLFROG_SESSIONS	coolfrog.sessions
COOLFROG_USERS		coolfrog.users
COOLFROG_LEADERBOARD	coolfrog.leaderboard
```

- Set the following **D1 database bindings**:

```
Variable name		D1 database
--------------------------------------------
COOLFROG_FORUM		coolfrog-forum
COOLFROG_GOALS		coolfrog-goals
COOLFROG_CHALLENGES	coolfrog-challenges
```

## You may now build the website.

- Navigate to the **Deployments** tab and create a deployment.

```
https://dash.cloudflare.com/<account-id>/pages/view/<sub-domain>
```

## Map to a custom domain.

- Navigate to the **Custom domains** tab and add "www.coolfrog.net" for the custom domain.

```
This domain is an example, but it is our canonical domain. Replace it with yours.
```

## Setup Cloudflare R2 (Object Storage)

- Since Cloudflare pages cannot build files over 25 MB, we must move them to a CDN.

- Navigate to the **R2** tab in the sidebar.

```
https://dash.cloudflare.com/<account-id>/r2/overview
```

- Create a bucket called "coolfrog".

- Download and mirror our large files and upload them to your bucket. Helpful tools: wget or [curl](https://curl.se).

```
https://cdn.coolfrog.net/cafe.mp3
```

- Naviage to the *Settings* tab in the bucket.

```
https://dash.cloudflare.com/<account-id>/r2/default/buckets/coolfrog/settings
```

- Connect the bucket to a **Custom Domain**, in this case our canonical CDN URL is:

```
cdn.coolfrog.net	
```

## Warnings for Future Developers:

#### If you have defined any npm packages, you must declare them in "package.json" in the root directory.

#### If you have defined any node.js APIs, you must use the "node:" prefix. (Do not do this for npm packages).

```
	DO THIS ---->	import { pbkdf2Sync } from 'node:crypto';
	NOT THIS ---->	import { pbkdf2Sync } from 'crypto';
```

#### The latest version of the Cloudflare pages build system requires a "wrangler.toml" file in the root directory.

- However its configuration can be as simple as this:

```
name = "coolfrog"
```
