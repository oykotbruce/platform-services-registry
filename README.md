![Test & Build](https://github.com/bcgov/platform-services-registry/workflows/Test%20&%20Build/badge.svg) [![img](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

# Platform Services Registry

The Platform Services' Project Registry is a single entry point for the Platform Service intake process. It is where teams can submit requests for provisioning namespaces in OpenShift 4 (OCP4) clusters, as well as perform other tasks such as:

- Update project contact details and other metadata;
- Request their project namespace set be created additional clusters;
- Request other resources be provisioned such as KeyCloak realms or Artifactory pull-through repositories.

## TL;DR

This repo contains all the components for the Platform Service Registry as well as all the OpenShift 4.x manifests to build and deploy said project. You can find more about each component here:

- [Web](./web/README.md);
- [API](./api/README.md); and
- [Database](./db/README.md)

## Project Structure

Find anything relevant to the project as a whole in the repo root such as OCP4 manifests; docker compose file; and development configuration. Each of the three main components to the project are listed below and have their own build and deployment documentation:

- [Web](./web/README.md);
- [API](./api/README.md); and
- [Database](./db/README.md)

## Architecture

The registry is a typical web app with an API backed by persistent storage. This serves to provide an interface for humans and automations alike, and, persist the data in a reliable way. Beyond this, the registry utilizes [NATS](https://nats.io/) to send message to "smart robots" that perform tasks outside of its scope.

These smart robots include:

| Name                   | Repo                                                           | Description                                                                                                                           |
| :--------------------- | :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| Namespace Provisioning | [here](https://github.com/bcgov-c/devops-fulfillment-pipeline) | This automation implements a GitOps approach to provisioning a namespace set with quotas and various service accounts on our clusters |

## How to Build & Deploy

There are lots of moving parts in the registry even though its a relatively simple web app. Each section below will walk you through the parameters and commands needed to deploy.

**ProTip** 🤓

All components should have the same label that can be used to remove them. This is useful in dev and test so that multiple deployments can be tested from a clean working namespace:

```console
oc delete all,nsp,en,pvc,sa,secret,role,rolebinding \
  -l "app=platsrv-registry"
```

### Role Based Access Control (RBAC)

Assuming you are building both the Patroni and Backup images in an OCP `tools` namespace, you will need some RBAC to pull said images from tools to your other namespaces for deployment. Read, then run, the RBAC manifest located [here](./openshift/rbac.yaml). It will enough access for the image puller to do its job.

```console
oc apply -f openshift/rbac.yaml
```

### Network Security Policy(ies)

As of OCP4 Network Service Policy (NSP) is required to allow all the components (Web, API, DB, and SSO) to communicate. In each of the Web, API and DB deployment manifests there will be a label to uniquely identify each component by `roll`; for the Patroni database there will be a unique characteristic to identify any pod that is part of the cluster. These are used in the NSP to enable communication.

In the `tools` namespace run this NSP to allow the build to pull resources form the internet:

```console
oc process -f openshift/templates/nsp-tools.yaml \
  -p NAMESPACE=$(oc project --short) | \
  oc apply -f -
```

Then, in each of the other namespaces run the application specific NSP. It will allow each component to talk to one another as necessary. To accommodate the different configuration of NATS in dev and test vs prod some parameters are required by the OCP template:

```console
oc process -f openshift/templates/nsp.yaml \
  -p NAMESPACE=$(oc project --short) \
  -p NATS_NAMESPACE=$(oc project --short) \
  -p NATS_APO_IDENTIFIER="app=nats"| \
  oc apply -f -
```

| Name                | Description                                    |
| :------------------ | :--------------------------------------------- |
| NAMESPACE           | The namespace where the NSP is being deployed. |
| NATS_NAMESPACE      | The namespace where NATS exists.               |
| NATS_APO_IDENTIFIER | The unique identifier used for NATS.           |

### Microsoft Graph API and Azure
Changes have been made to this product in terms of how PO and TL contacts are searched for and added to request profiles. Instead of adding Git users through the Git API, we will now use IDIR identities fetched via Microsoft's Graph API. API documentation can be found [here](https://learn.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http).
#### Project on Azure
The OAuth flow for calls to the Graph API requires an application registered on the Government of BC Azure domain. The registered application can be found [here](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/5afdfc62-637b-41cf-b186-b2de816faaf9/isMSAApp~/false), and lists the Client ID and Azure Tenant ID needed to receive the authorization token to make calls to the Graph API. These values are unchanging, and need not be configured in Platform Services Registry to make this authorization flow work. The values are hardcoded in web/src/redux/githubID/graphAuthConfig.js.

#### Redirect URL
Make sure that the URL to Platform Services Registry is added to the Platform Services Registry application as configured in Azure. This is necessary for getting an access token back, allowing users to use the Graph API.
![Redirect URL used for feature development](./DocAsset/redirect_Uris.png)

#### User Delegate Permission Scope
API permission for Graph calls is based on user delegate scopes, or in other words, calls are made on behalf of the signed in user rather than the application. This makes no difference to user experience other than that a constent dialog box may flash on screen for a split second, or if using a browser in incongnito mode, you will be required to go through Microsoft's sign in process via the BC gov signin page. 

### Database

The build and deploy documents for PostgreSQL (Patroni) are located in the [db](./db) directory of this project.

### Database Backup Container (Prod Only)

The community supported backup container is used to backup the database. Setup the database container using the helm charts:

```console
helm repo add bcgov https://bcgov.github.io/helm-charts

helm install db-backup bcgov/backup-storage -f ./openshift/backup/deploy-values.yaml
```

### API

The build and deploy documents for the API are located in the [api](./api) directory of this project.

### Web

The build and deploy documents for the Web are located in the [web](./web) directory of this project.

### READ-ONLY ADMIN

To effectively assist teams calling 7-7000 for application support after hours, we created read-only access to the Project Registry. This allows looking up information for the app's Technical Lead as sometimes the caller may not have this. Read-only admin access will allow the user to view all of the projects that the Registry App manages but can't make any changes to it.

#### To add/remove a read-only admin

Registry app is using keycloack devhub realm to do authentication, so we will need to navigate to the keycloack page to make this change to the user's profile. Here's how to do it.

1.  Navigate to:
    ```
    https://oidc.gov.bc.ca/auth/admin/devhub/console/#/realms/devhub/users
    ```
2.  Search for the user idir in the search bar
3.  Navigate to Role Mapping tab and search for and select `Registry web` under Client Roles
4.  After select `Registry-web`, You will see two options in the Available Roles tab. One of them is read_only_administrator; highlighting that option and clicking `Add Selected` will do the job.

### NATS (Dev & Test Only)

The API needs to connect to [NATS](https://nats.io) for messaging the "smart robots". In production a shared NATS exists, however, in dev and test there no such thing. Fire up a stand alone NATS instance to accept message from the API.

Deploy a stand alone, single Pod instance of NATS with the DeploymentConfig provided. Provide its service to the API when deployed so it can find and use this service.

```console
oc process -f openshift/templates/nats.yaml
```

## Project Status / Goals / Roadmap

Additional features and fixes can be found in backlog; find it under issues in this repo.

## Getting Help or Reporting an Issue

If you find issues with this application suite please create an [issue](https://github.com/bcgov/secure-image-app/issues) describing the problem in detail.

## How to Contribute

Contributions are welcome. Please ensure they relate to an issue. See our
[Code of Conduct](./CODE-OF-CONDUCT.md) that is included with this repo for important details on contributing to Government of British Columbia projects.

## How to setup Local development

We suggest running this in a docker container, you can download docker [here](https://www.docker.com/get-started).

This application has a function that will invite GitHub users to a specified GitHub organization, to make it locally, you will need to create your own test GitHub organization and GitHub App.

**Step 1**
Create a/two GitHub Organization(s) [here](https://github.com/account/organizations/new?coupon=&plan=team_free) or you can use any existing organization that you have full access permissions organization
(ps\*: API can invite the user into one or multiple GitHub org(s). for testing and development purpose, we suggest you at least create two GitHub orgs to make sure this function works properly)

**Step 2**

- Under organization setting => Developer settings => GitHub Apps create a new GitHub app. (`https://github.com/organizations/[REPLACE_WITH_YOUR_ORG_NAME]ap/settings/apps`)
- Give your app a meaningful name, and description.
- Homepage URL can be anything, I recommend we can fill in with `http://localhost:8100/api`.
- Make sure **Expire user authorization tokens**, **Request user authorization (OAuth) during installation** and **Webhook:Active** boxes are unchecked.[]
  <img src="DocAsset/github_app_screen_shot1.png" width="500" height="600">
- In your apps permissions configuration, ensure to add read/write to member.
  <img src="DocAsset/github_app_screen_shot2.png" width="500" height="80">
- You can allow any account to installed this GitHub App.

**Step 3**

- Create and save a client secret, this will be needed as env variable
- Create and save the GitHub App private key(.pem file), this will be needed to deploy the server
- Click Install App in side bar, find the test organization created earlier, click Install to install application to organization

**Step 4**

- In `api/src/config` run `cp config.json.example config.json` to copy `config.json.example` and create `config.json`. Update **orgs** and **primaryOrg** to the organization name that you have your GitHub App installed on.

- copy the private key from the GitHub App you just downloaded to `api/src/config` and rename it to `github-private-key.pem`

**Step 5**

- Copy `.env.example` to create `.env`.
- You can find the `Client ID` and `App ID` on the GitHub App page, copy those values to `GITHUB_CLIENT_ID` and `GITHUB_APP_ID`.
- Copy the client secret that you saved in Step 3 to `GITHUB_CLIENT_SECRET`
- Fill `GITHUB_ORGANIZATION` with Organization name that you have your GitHub App installed on.

**Last Step**

- In application root directory: run `mkdir pg_data`
- In **_/api_** directory run

```
npm install
npm run build
```

- In **_/web_** directory run

```
npm install
```

Now you are ready to go back to application root directory and run `docker-compose up -d`

After Docker Container finish creating, you can vist you local build at: http://localhost:8101/public-landing

## Tips

- Create an empty pg_data folder for the database:
  `mkdir pg_data`
- Install and build the api dependencies and application:
  `cd api && npm install && npm run build && cd ..`
- Install the web dependencies:
  `cd web && npm install && cd ..`
- Build the docker images:
  `docker-compose build`
- Start Platform Services Registry
  `docker-compose up -d`

## License

See the included [LICENSE](./LICENSE) file.
