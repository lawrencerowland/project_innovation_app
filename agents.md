Great. I’ll review the background and ontology for GI2MO in your repositories and draft a full software engineering specification for a web-based innovation app focused on project scoping and management, using the ontology as the core framework for data, workflows, and interface logic. The spec will emphasize idea collection and scoping (about 2/3 of the effort), with briefer treatment of later project lifecycle stages. It will be designed to run from GitHub Pages with no initial integration, but leaving hooks for future connection to GitHub Projects.

I’ll let you know once the draft spec is ready for your review.


# Innovation & Project Management App – Comprehensive Specification

## Introduction

This specification outlines a web-based **Innovation and Project Management App** that leverages the **Generic Idea and Innovation Management Ontology (GI2MO)** as its backbone. The app is designed to facilitate the end-to-end innovation pipeline – from idea submission and evaluation through project initiation and tracking – with deployment as a static site on **GitHub Pages**. GI2MO provides a rich domain ontology for idea management systems, covering all knowledge gathered in such systems and enabling interoperability between distributed idea management platforms and other enterprise systems. By using GI2MO as the data model, the application gains a structured framework for **idea generation**, **evaluation**, and **tracking** of innovation proposals, ensuring that all stages of the innovation lifecycle are formally represented.

In this document, we detail the system’s architecture, data models (mapped to GI2MO), user roles, workflows, UI components, and integration points. Approximately two-thirds of the focus is on the **idea collection and project scoping phases** – including idea submission, clustering/organization, evaluation, and selection of ideas for implementation. We also describe foundational support for downstream **project execution and tracking** (in a less detailed manner), which can be later expanded or integrated with external tools (such as GitHub Projects). All design decisions account for the constraints of **GitHub Pages deployment**, meaning the solution emphasizes a static front-end architecture with optional integrations for dynamic data management.

## System Architecture and Deployment

### Architecture Overview

The application follows a **client-side Single Page Application (SPA)** architecture, consisting of a static front-end that runs entirely in the user’s browser. The app is built with standard web technologies (HTML, CSS, JavaScript, and optionally a front-end framework like React or Vue) and communicates with data sources via web APIs. Figure 1 below summarizes the major components and their interactions:

* **Client Application:** The browser-based front-end is responsible for all user interface rendering, user interactions, and application logic. It loads the GI2MO-based ontology data model at startup (as JSON or embedded data) and uses it to enforce structure (e.g. which fields an “Idea” has, allowable relations, etc.). All state (ideas, contests, projects, etc.) is managed on this client side, either in memory or via local storage and remote calls.

* **Data Persistence Layer:** Because GitHub Pages does not support a server-side database, the app uses a modular data persistence approach:

  * In the simplest setup, **static JSON files** (hosted in the same GitHub Pages repository) can serve as a data store for initial idea records, categories, etc. These can be fetched at runtime for read-only data (e.g. initial categories, or example ideas).
  * For dynamic data (new idea submissions, comments, etc.), the client can leverage **GitHub’s APIs** (REST/GraphQL) to read and write data. For example, each idea could correspond to a GitHub Issue in a specific repo, and the app would use authenticated API calls to create or update issues representing ideas. This effectively turns GitHub’s back-end into the app’s datastore while still keeping the app serverless. (Alternatively, a third-party backend or serverless functions could be introduced if needed in the future.) All such calls are made from the client side using the user’s credentials (e.g. via OAuth) since there is no server component in the app.
  * The data access layer is abstracted so that future integration with other services (or an internal API) is possible. For instance, if an organization later hosts a dedicated API or integrates with **GitHub Projects**, the app’s data layer can be pointed to those endpoints without changing the core logic. This design anticipates but does not require immediate integration with GitHub Projects or other external systems – the architecture leaves **open endpoints** and modular interfaces to plug in such services when available.

* **Ontology Model (GI2MO):** The GI2MO ontology definition (in OWL/Turtle form) is embedded or referenced in the app to define the data structures. The app may include a lightweight ontology library or hard-coded schema that mirrors GI2MO classes and relationships. This ensures that, for example, an “Idea” object in the app corresponds to the GI2MO `Idea` class, an idea’s status corresponds to a `IdeaStatus` instance, a project uses the DOAP `Project` spec, etc. The ontology also drives form generation and UI – e.g. knowing that an Idea can have attachments or comments means those components are present in the UI.

* **External Integrations (Optional):** While the initial deployment runs fully on the client, the design considers optional integrations:

  * **GitHub Authentication:** To associate actions with real user accounts and enforce roles, the app can use GitHub OAuth login. This is especially needed if using GitHub Issues/Projects as a backend (so that idea submissions or comments are created under the user’s identity). The app will gracefully degrade to a “demo mode” without login if needed (treating all users as guests who can submit ideas that are stored locally or in a dummy JSON).
  * **GitHub Projects Integration:** If enabled, when an idea is selected for implementation, the app can automatically create a corresponding entry in GitHub Projects or link to an existing project board. This could involve calling GitHub’s project APIs to create a project card or a repository for the idea. The system architecture anticipates this by separating the *idea management module* from the *project tracking module*, using interfaces that could call GitHub. In the interim (without integration), the project tracking module simply stores minimal project data locally (or in JSON) and provides a placeholder in the UI for project status.
  * Other future integrations (e.g. corporate SSO for user auth, sending notifications via email or chat, etc.) can be added by extending the client or introducing light serverless endpoints. The architecture’s modularity ensures these additions do not require a fundamental redesign.

### GitHub Pages Deployment Considerations

Being deployed on **GitHub Pages** imposes certain constraints which the system design addresses up-front:

* **Static Hosting:** GitHub Pages can only serve static files (HTML, CSS, JS, JSON). There is **no server-side code** execution. All dynamic behavior must be handled in the browser or via external APIs. This means features like form submissions, data persistence, and user authentication must happen through client-side scripts. Our app is therefore optimized as a pure front-end application. The build (if using a framework) will produce static assets that are pushed to the `gh-pages` branch for hosting. We avoid any reliance on server frameworks or databases in deployment.

* **Data Storage:** Without a server database, persistent data must live in files or external services:

  * For demonstration or initial deployment, the app might maintain a JSON file (or a set of JSON files) in the repo containing all ideas, contests, etc. This file can be updated manually or via pull requests to simulate persistence. However, this approach is not scalable for real-time use.
  * A more interactive approach is using the GitHub REST API (accessible from client-side JavaScript). The app can store each idea as a GitHub Issue (with labels or a specific template to carry metadata), comments as issue comments, and so forth. Attachments can be files attached to issues or links. This leverages GitHub’s infrastructure while staying within a static app context. We ensure that any such API usage respects GitHub’s rate limits and CORS (Cross-Origin Resource Sharing) requirements – GitHub’s API supports AJAX calls with proper authentication tokens.
  * We also consider local storage or IndexedDB for caching data on the client to reduce API calls. For example, after loading all ideas once, the app can cache them in the browser for the session. However, authoritative data still resides in the GitHub repository or API to allow multiple users to see each other’s contributions.

* **Performance and Size:** All heavy logic (ontology processing, data filtering, etc.) runs on the client, so we ensure the front-end code is optimized. The GI2MO ontology file is loaded in a lightweight manner (possibly converted to JSON or only the needed parts) to avoid large parse times. The app will lazy-load data when possible (e.g. fetch detailed data for an idea only when viewing it). Since GH Pages has bandwidth limits, we keep assets efficient (images compressed, etc.). The static nature also means no on-demand server computation – any computations (like clustering suggestions) happen in the browser, possibly using libraries or web workers if needed for performance.

* **Security:** Without a server, sensitive operations must be carefully handled. If using GitHub APIs for data writes, the OAuth tokens are stored in the client (in memory or local storage) – which is secure only as long as the user’s session, but we instruct users to only log in on trusted devices and we never hard-code secrets. All interactions with GitHub are over HTTPS. We also cannot hide any administrator functionality behind server checks – so the app must enforce role permissions in the client (which can be inspected). This is acceptable for a GitHub Pages app in a moderate-trust environment (e.g. internal users) but noted as a limitation: truly secure role enforcement would require a backend. We mitigate this by limiting what unauthenticated or unauthorized users see in the UI (e.g. they won’t even see admin buttons), and by using GitHub’s permission model (e.g. only org members with proper repo access can post via the API, etc., if leveraging GitHub as backend).

In summary, the architecture is a **modular client-side application** underpinned by GI2MO ontology models, designed to run on GitHub Pages. It carefully balances static deployment constraints with the need for dynamic innovation management features by offloading persistence to GitHub or similar services. This ensures ease of deployment (just push to GitHub Pages) and low maintenance, while leaving room for future integration with more robust backends or GitHub’s project management features.

## Data Models and GI2MO Ontology Mapping

At the core of the system are the **data models** that represent ideas, innovation campaigns, and projects. These models are directly informed by the GI2MO ontology classes and properties, ensuring that the app’s data structures are semantically rich and interoperable. The following are the key entities in the data model and how they map to GI2MO (and related ontologies):

* **Idea** – corresponds to the GI2MO `Idea` class. An **Idea** is the fundamental entity representing a single innovation proposal or suggestion. Each Idea in the app has attributes such as:

  * **Title** (short name of the idea)
  * **Description** (detailed explanation of the idea, which may be broken into multiple fields or sections as needed – GI2MO allows supplementary descriptions for different aspects, though in our app we treat it as a primary description plus optional fields for specific details like “beneficiaries” or “cost estimate”).
  * **Submitter/Creator** (the person who submitted the idea, linked to a **User** profile; in GI2MO terms this would be a FOAF `Agent` or `OnlineAccount` representing the user).
  * **Submission Date** (timestamp).
  * **Status** (the current stage of the idea in its lifecycle, see IdeaStatus below).
  * **Category/Topic** (a classification of the idea’s subject matter, see Category below).
  * **Attachments** (zero or more files or links attached to the idea, see Attachment below).
  * **Related Links** (optional external URLs or references).
  * **Relationships to other ideas**: The app supports linking ideas together using GI2MO-defined relationships. For example, if two ideas are about the same underlying concept, they can be marked as **similar** using GI2MO’s *describesSameObject/hasSimilar* relationship (indicating one idea describes an innovation on the same object/topic as another). If an idea is essentially a duplicate of another, it can be marked as a **duplicate** (using *hasDuplicate/isDuplicateOf*; GI2MO defines *hasDuplicate* as indicating another idea that partially or fully duplicates the content of the current idea). The data model will maintain references to related Idea entries to support moderators in merging or clustering ideas.
  * **Comments and Reviews** (see below: ideas will link to discussion comments and evaluation reviews).
    Each Idea is uniquely identified (by an ID or a GUID) and stored in the system (or in GitHub Issues, etc.) as a distinct record. The GI2MO mapping ensures that if needed, these ideas could be exported or linked to another system using the same ontology without loss of information.

* **Idea Status** – corresponds to the GI2MO `IdeaStatus` class. An IdeaStatus instance represents the stage of an idea in the idea management lifecycle. In the app, *Status* is typically an enumeration with values such as:

  * **Draft** – the idea is saved but perhaps not yet officially submitted (this could be used if the app allows saving an idea privately before formal submission).
  * **Submitted** (or *Under Review*) – the default state when an idea is submitted and awaiting evaluation.
  * **Reviewed** – the idea has been evaluated (this could be a sub-state indicating that at least one review is completed).
  * **Selected** (or *Approved*) – the idea has been chosen to move forward as a project.
  * **Rejected** – the idea was evaluated and decided not to pursue (perhaps accompanied by a reason).
  * **Implemented** – the idea’s resulting project has been completed and the idea realized.
  * **Deployed** (if applicable) – for ideas that lead to deployed solutions (e.g. a product feature that is now live).
  * **Archived** – the idea is closed out (could be after implementation or if it’s rejected and period has passed).
    These statuses and their transitions define the workflow for ideas. GI2MO provides guidance with examples like *Draft, Implemented, Deployed*, etc., and our app will adopt a similar set. Status values may be configurable by administrators (e.g. to add a custom stage), but by default will include the above. The data model represents status as a property of Idea, and possibly as distinct objects if needed (though in implementation it can be a simple string/enum, since the ontology mapping is mostly conceptual here).

* **Idea Contest** – corresponds to GI2MO `IdeaContest` class. An IdeaContest (also known as an **idea campaign** or **idea challenge**) represents a themed or time-bound collection of ideas. In the app, an IdeaContest has:

  * **Name/Title** (e.g. “2025 Innovation Challenge: Customer Experience”).
  * **Description** (context or problem statement for the contest).
  * **Thematic Category** (the theme tying the ideas, e.g. “Improve customer satisfaction”).
  * **Start and End Dates** (submission window for the contest – after the end date, no new ideas can be submitted to this contest).
  * **Contest Status** (e.g. *Open* for submissions, *Closed* for new submissions, *In Judging*, *Winner Announced* etc., corresponding to GI2MO `IdeaContestStatus`).
  * **Ideas**: a list of Idea entries that have been submitted to this contest. Each idea can optionally belong to one contest (the app will allow tagging an idea with a contest upon submission). Contests help **bind ideas thematically and to a particular time period**, which is useful for organizations that run innovation campaigns.
    In the data model, contests are separate entities that can be retrieved and listed. The relationship between IdeaContest and Idea is one-to-many (one contest can have many ideas; an idea can belong to zero or one contest by design). If an idea does not belong to any contest, it can be considered part of a general pool or “ongoing” ideation system. Administrators will manage contests (create, edit, close them) via the UI.

* **Category (Taxonomy)** – the app uses **categories** or **tags** to classify ideas (and possibly reviews) by topic. GI2MO originally had a `Category` class but deprecates it in favor of using SKOS (`skos:Concept`) for taxonomy. In our system, we will implement categories as a controlled vocabulary of topics (e.g. cost reduction, UI improvements, process innovation, etc.). Each Idea can be assigned one or multiple categories from this taxonomy. Categories help in filtering and clustering ideas by subject matter. GI2MO notes that predefined categories are commonly used to group ideas by topic (for example, a tech company might have categories like “Laptops” vs “Desktops” for product ideas). We will provide an initial set of categories and allow administrators to add or modify them. Technically, categories will be stored in a JSON file (or as GitHub labels if using Issues as backend), and each idea record will reference the category IDs. The app UI will present categories as tags or a dropdown. For **reviews**, categories can also apply (e.g. tagging a review as focusing on ROI or customer benefit), but initially we will primarily use categories for ideas. If needed, tagging of reviews or finer classification can be added, given GI2MO’s support for that concept.

* **Attachment** – corresponds to GI2MO `Attachment` class. Attachments are external resources (images, documents, etc.) associated with an idea (or potentially with an idea contest). In GI2MO, an Attachment is “any entity in the idea management system attached, e.g. an image attachment to an idea”. In our data model, an Attachment includes:

  * **File URL or reference** – if stored in GitHub, this could be a link to the file in the repository or an uploaded asset; if external, a URL.
  * **Filename/Title** (for display).
  * **Media Type** (image, PDF, etc., for icon display or handling).
  * Attachments are linked to their parent idea (or contest). An idea can have multiple attachments. They might be displayed as thumbnails or links in the idea detail UI.
    Because on GitHub Pages we cannot handle file uploads directly without a backend, attachments will likely be handled via one of two methods: (a) providing a link input (the user pastes a URL to an externally hosted file or image), or (b) instructing the user to attach files via an alternate route (if using GitHub, perhaps attach to the GitHub Issue via the GitHub interface or a separate upload tool). The data model still supports attachments as first-class objects, even if the process to add one is external.

* **Comment** – corresponds to GI2MO `Comment` class. A Comment is a simple piece of textual discussion attached to an idea or other entity. In the app, comments enable collaborative discussion and clarification on ideas. Each Comment contains:

  * **Text content** (the body of the comment).
  * **Author** (user who wrote the comment).
  * **Timestamp**.
    Comments in our model are primarily associated with Ideas (users can comment on ideas to ask questions or provide feedback). GI2MO allows comments on multiple entities (ideas, contests, reviews, etc.); our UI will mainly expose commenting on ideas, and possibly on reviews or contest descriptions if needed. If using GitHub Issues as storage, comments naturally map to issue comments via the API. Comments are different from **Reviews** (evaluation inputs) in that they are informal and for discussion rather than structured evaluation.

* **Review** – corresponds to GI2MO `Review` class (with possible sub-classes like `TextualReview` for text-based evaluations). A Review in our app represents a formal evaluation or assessment of an idea, typically performed by a designated evaluator or a group of stakeholders. GI2MO defines a Review as an assessment (text, rating, or any kind of appraisal) of an idea by one or more people. Key aspects of the Review model:

  * **Review Type**: We support at least two types of reviews – textual reviews (free-form feedback) and **ratings** (numerical scores or votes). GI2MO’s design accommodates both: a *TextualReview* is one subtype (written feedback), and one could imagine a “RatingReview” as another (not explicitly given in GI2MO, but GI2MO suggests extending the class for additional types). For simplicity, our initial app will allow **text comments as reviews** (possibly flagged as “official review”) and a simple **star rating or upvote count** as a form of crowd evaluation.
  * **Content/Score**: If textual, the content is the written evaluation. If a rating, the content might be a numeric score (e.g. 1-5 stars or a vote). We can treat both uniformly in data with fields for “text” and “score” (one may be empty depending on type).
  * **Reviewer**: the user or role that provided the review (linked to User profile). This could be an expert, a manager, or even community members in the case of votes.
  * **Criteria**: (Optional) We may define certain criteria for reviews (e.g. “Impact”, “Feasibility”, “Novelty”) and allow reviewers to give a score or comment on each. GI2MO allows that a review can be a single action or an aggregate of multiple inputs. In our implementation, an individual review entry will typically correspond to one reviewer’s evaluation (covering potentially multiple criteria internally). We might aggregate results separately (e.g. calculate average scores).
  * **Relation to Idea**: Each review is linked to the idea it evaluates. The data model might also link reviews to specific contest if needed (e.g. contest-level judging), but primarily it’s idea-centric.
  * **Global Review Summary**: GI2MO notes the possibility of having a review object represent an aggregate summary of multiple people’s assessments (for instance, a computed average rating). Our app will not treat that as a separate object initially; instead, it will calculate summary metrics on the fly (like an average star rating or a combined scorecard). If needed, a special Review entry with a flag “aggregate=true” could be used to store summary info.

  In essence, **Reviews provide the structured evaluation** mechanism in the idea phase. The data model’s alignment with GI2MO means we can capture both **individual review actions** (with their authors, to enforce one per evaluator) and consider extensibility for custom review types in the future.

* **User (Participant)** – the app will have a concept of **User accounts** primarily to distinguish roles and track authorship of content (ideas, comments, reviews). GI2MO leverages FOAF (`foaf:Agent` and `foaf:OnlineAccount`) to represent people and their accounts in the system. In our implementation, if integrated with GitHub, a User corresponds to a GitHub user (with their OAuth identity). If run in a standalone mode, a User can be a simple object with a name, email, and role. We will store minimal user profile info needed:

  * **Username/Display name**.
  * **Role** (see Roles section below).
  * Possibly an avatar URL (if using GitHub, we get their profile picture).
  * Contact info if needed (email, etc., though likely not needed in this app).
    There isn’t a heavy user profile management in this static deployment; it’s mostly for attribution and permission logic. If not logged in, users will be treated as guests who can browse but not submit (or submit anonymously, if that’s allowed in config).

* **Project** – corresponds to the DOAP `Project` class as referenced by GI2MO. Once an idea is selected for implementation, it transitions to a **Project** which represents the execution phase (e.g. a project to actually implement the idea in the real world). Rather than reinvent a project schema, GI2MO suggests integrating with DOAP (Description of a Project) ontology for describing projects. In our app, a Project entity includes:

  * **Project Name/Title** (often this could remain the same as the idea title or a slightly refined name for the initiative).
  * **Summary** (brief of what the project will accomplish – often inherited or expanded from the idea description).
  * **Linked Idea**: reference to the original Idea that spawned the project.
  * **Project Manager/Owner**: user who is responsible for this project (may default to the idea submitter or the innovation manager who approved it, but ideally assigned to someone who will lead implementation).
  * **Team Members**: a list of users or stakeholders involved (if tracking that).
  * **Start Date, End Date** (or target dates, if known).
  * **Status**: project status (e.g. Not Started, In Progress, Completed, On Hold). This is distinct from idea status – once an idea becomes a project, its idea status might be “Implemented” while the project itself has its own lifecycle.
  * **Tasks/Milestones**: in a full-featured system, a project would have a breakdown of tasks or milestones. Since our focus is not execution detail, we will model this minimally – perhaps a simple checklist of tasks or a pointer to an external project board. If integrating with GitHub Projects, we might list the issues or cards from that project here. Initially, we might allow adding a few text tasks with checkboxes as a lightweight tracking.
  * **Repository/Artifact Links**: If the project involves code or other artifacts, a link to the GitHub repository or other resources can be stored.

  The app’s project representation will be designed to be **compatible with GitHub Projects** if integration is turned on. That means we could fetch the list of tasks from a GitHub Project and display it, or create a new GitHub Project for the idea. The Project entity in our data model stores the mappings needed (e.g. GitHub Project ID or repo links). If no integration, it simply holds whatever data is entered via the app’s UI. Essentially, **Project** forms the bridge to execution: it is less detailed than a full project management tool but ensures the idea doesn’t just vanish after selection – it is tracked through to completion.

All these entities and relationships are derived from or aligned with GI2MO to the fullest extent. Using GI2MO ensures that the semantics of each element are well-defined (e.g., an “IdeaContest” is known to group ideas thematically in a time-bound event, a “Review” is recognized as either an individual assessment or an aggregate of assessments, etc.). The **ontology mapping** also means our data model could be exported as RDF/OWL data if needed, or interconnected with other systems (for example, linking ideas to enterprise knowledge graphs). For everyday use, these are just JavaScript objects or JSON records, but the GI2MO vocabulary is the conceptual blueprint behind them.

To summarize the mapping, the table below highlights major GI2MO (and related) ontology elements and their implementation in the app:

| **Ontology Class/Property**                                  | **App Entity or Attribute**                 | **Usage in App**                                                                                                                                  |
| ------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Idea` (GI2MO)                                               | **Idea** (innovation proposal record)       | Core entity representing an idea in the system. Has title, description, etc., and links to status, category, author, etc.                         |
| `IdeaStatus` (GI2MO)                                         | **Idea Status** (enumeration on Idea)       | Lifecycle stage of idea (Draft, Submitted, Approved, Implemented, etc.). Stored as a field on Idea; controlled by workflow transitions.           |
| `IdeaContest` (GI2MO)                                        | **Idea Contest** (Campaign object)          | Represents an idea campaign or challenge event. Contains contest info and a set of ideas.                                                         |
| `IdeaContestStatus` (GI2MO)                                  | **Contest Status** (state of contest)       | Stage of the contest (e.g. Open or Closed). Helps manage contest lifecycle (not started, accepting ideas, voting, ended).                         |
| `Category` (GI2MO deprecated) or `skos:Concept`              | **Category/Topic** (taxonomy tag)           | Classification of ideas by topic. Implemented as tags in the app. GI2MO suggests using SKOS Concept for this taxonomy.                            |
| `Attachment` (GI2MO)                                         | **Attachment** (file/link attached to Idea) | Files or resources attached to ideas (images, docs). In app, stored as URL references with metadata.                                              |
| `Comment` (GI2MO)                                            | **Comment** (discussion entry)              | User discussion comments on ideas. Stored with author and timestamp, linked to Idea.                                                              |
| `Review` (GI2MO)                                             | **Review** (evaluation record)              | Formal evaluation of an idea (text feedback or numeric rating). Linked to Idea and reviewer; possibly subclassed as needed (e.g. text vs rating). |
| `TextualReview` (GI2MO)                                      | **Textual Review** (review subtype)         | Implementation of a text-based review. In app, a Review with only comments and no numeric score.                                                  |
| *(RatingReview)* (not explicit in GI2MO, but extension)\*    | **Rating** (evaluation subtype)             | Implementation of a rating (star/upvote). Not a separate class in GI2MO 0.6, but app treats numeric reviews distinctly for UI.                    |
| `describesSameObject` / `hasSimilar` (GI2MO property)        | **Similar Idea** link                       | Relationship connecting ideas on the same topic. App uses this to cluster related ideas (marked by moderators).                                   |
| `hasDuplicate` / `isDuplicateOf` (GI2MO property)            | **Duplicate** marker                        | Relationship flagging duplicate ideas. Used when merging ideas; duplicate ideas can be archived or linked to the primary one.                     |
| `generalizes` / `details` (GI2MO property)                   | **General vs Specific** idea link           | (Advanced usage) Indicates one idea is a broader concept encompassing another. Could be used for hierarchical ideas (not in initial scope).       |
| `Project` (DOAP ontology via GI2MO)                          | **Project** (implementation project)        | Represents the project executing an idea. Stores project metadata and links to idea. Prepares for GitHub Projects integration.                    |
| `foaf:Agent`, `foaf:OnlineAccount` (FOAF ontology via GI2MO) | **User** (account profile)                  | Represents users in the system (submitters, reviewers, etc.). In app, mapped to GitHub user or local user object for roles.                       |

Through this ontology-driven model, our app ensures **consistency** and **completeness** in representing innovation data. Every piece of information (from a basic idea description to a complex review summary) has a place in the model, and the GI2MO mapping guarantees that our definitions align with established semantics in innovation management.

## User Roles and Permissions

The app will support multiple **user roles**, each with specific permissions that align with the innovation workflow. Defining roles is crucial in a multi-user idea management system to ensure proper moderation and evaluation flows. Below are the primary roles and their capabilities:

| **User Role**                            | **Description & Responsibilities**                                                                                                                                                                                                                                                                                                        | **Key Permissions in App**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Idea Contributor** (Submitter)         | General user who submits ideas. This can be any employee or community member participating in the innovation process. They propose new ideas and can view and discuss others’ ideas.                                                                                                                                                      | - Submit new ideas (fill out idea submission form).<br>- Edit or withdraw their own ideas (if in draft or if allowed).<br>- View ideas submitted by others (unless an idea is marked confidential).<br>- Comment on ideas (discussion participation).<br>- View public review results or status updates for ideas.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Reviewer/Evaluator**                   | A subject-matter expert or designated evaluator who reviews and rates ideas. In some cases, all users can vote (crowd voting), but here we refer to formal reviewers. This role might overlap with Contributor in some cases (e.g. peers reviewing each other’s ideas) but is distinguished by permission to record official evaluations. | - All permissions of Contributor, plus:<br>- Access to the **evaluation interface** for assigned ideas (or all ideas, depending on config).<br>- Submit **Reviews** (scorecards, textual evaluations) on ideas.<br>- Possibly vote or rate ideas (if a separate voting mechanism exists).<br>- View other reviewers’ inputs (if permitted) and summary of evaluations.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Innovation Manager** (Moderator/Admin) | The administrator or moderator of the innovation program. This person (or team) oversees the idea pipeline: organizing ideas, running contests, assigning reviewers, and making final selections. They ensure the system runs smoothly and that quality ideas are recognized.                                                             | - Full read/write access to all innovation data.<br>- Create and manage **Idea Contests** (campaigns), including defining contest parameters and categories.<br>- Edit or categorize submitted ideas (can tag, reassign categories, fix descriptions if needed).<br>- **Cluster and merge ideas**: mark ideas as duplicates or link similar ideas for consolidation.<br>- Manage the category taxonomy (add/remove categories/topics).<br>- Assign roles or designate certain users as reviewers for specific ideas or contests.<br>- View all reviews and analytics (e.g. sort ideas by highest score).<br>- Change **Idea Status** of any idea (e.g. move it to “Selected” or “Rejected” based on decisions).<br>- Initiate **Projects** from ideas (trigger the project creation process when an idea is approved).<br>- Generally, perform administrative functions like removing inappropriate content, managing user access (if needed), and configuring integration settings (like connecting the app to GitHub via tokens). |
| **Project Owner/Team**                   | (Comes into play in project execution phase) The person or team responsible for implementing an approved idea. Often this could be the innovation manager or a separate project manager and development team. They use the app mainly in the project tracking capacity.                                                                   | - View the selected idea’s details and any documentation from the ideation phase.<br>- Update **Project** information: status updates, progress, add tasks or mark them complete.<br>- Add implementation notes or further attachments (like design documents, etc.) to the project record.<br>- (If integrated with GitHub Projects, they might link the app’s project view to actual GitHub issues or updates.)<br>- *Note:* The project owner role may be external to the ideation app’s core usage; they might primarily work in other tools (like GitHub or a PM tool), with the app capturing high-level status. For the spec, we consider they have permissions to update the project info in our app for completeness.                                                                                                                                                                                                                                                                                                      |

In smaller deployments, one person might fill multiple roles (e.g. an admin can also submit ideas, or a reviewer might also be the one who proposed the idea). The app’s permission system will therefore be flexible: roles can be combined, and the UI will adjust (e.g. an admin sees all admin features plus normal submission features). If integrated with GitHub for authentication, role assignment could be based on GitHub team membership (for instance, all users in a “Innovation Reviewers” team get reviewer rights). In a simpler stand-alone mode, roles might be assigned via a config file or by treating the first user as admin, etc.

**Anonymous or public users:** If the app is made public (accessible to anyone on the internet via GitHub Pages), by default such users would only have browsing capability – they can view published ideas and maybe comments, but cannot contribute. Submissions would require login (to avoid spam and to attribute ideas to someone). Alternatively, an instance could allow anonymous idea submission (saved with a placeholder user), but this is generally not recommended and is not a default scenario in our spec.

**Role enforcement:** Since the app is client-side, enforcement of permissions is done in the UI logic – e.g. if you’re not an admin, you won’t see the “Select Idea” button or the contest creation screen. If someone manipulated the client to perform an admin action via API, the worst-case scenario is that GitHub’s underlying permissions might block it (if using GitHub issues, for example, a user without repo access can’t create an issue in a private repo). In an environment without that safety, it’s assumed users will mostly stick to the intended usage. This is a known limitation of static deployments and is mitigated by integrating with the platform’s access control where possible.

With roles established, the next section describes how these users interact with the system through various **workflows**, particularly focusing on idea collection and selection.

## User Workflows

This section walks through the key workflows in the system, aligning with the innovation process stages. Each workflow describes how different user roles participate, what data is used, and how the system behaves. The **focus is on idea collection and project scoping** (submission through selection), with a brief outline of project execution and tracking at the end.

### 1. Idea Submission Workflow

**Purpose:** Allow users to submit new innovative ideas into the system. This is the starting point of the innovation pipeline.

**Participants:** Idea Contributor (Submitter); the system (which records the idea); optionally an Innovation Manager (if approval of submissions is required, though typically ideas are directly logged).

**Steps:**

1. **Initiate Submission:** A contributor navigates to the “Submit Idea” page or clicks a “New Idea” button. If not logged in, the app prompts for authentication (especially if using GitHub to log who is submitting). If the app allows draft saving, the user could also start a draft without finalizing submission.
2. **Fill Idea Form:** The user is presented with a form to enter idea details. This includes fields such as:

   * *Title*: one-liner for the idea.
   * *Description*: a multi-line field where the core idea is explained. The app might also have additional optional sub-fields (like “Problem Statement”, “Proposed Solution”, “Expected Benefit”, etc., which can correspond to GI2MO’s notion of additional descriptions, but initially a single description box is sufficient).
   * *Category*: the user selects one or more categories/tags that apply (from a dropdown of predefined topics). This is tied to the taxonomy in the data model.
   * *Attachments*: the user can attach supporting files or provide links (e.g. a link to a mockup image or a Google doc). The UI might allow adding multiple attachments (with fields to paste URLs or upload if possible).
   * *Contest*: if there are active Idea Contests, the form lets the user associate the idea with a specific contest (e.g. a dropdown “Submit under: \[General Ideas] or \[2025 Challenge]”). If an idea contest is selected, the idea will inherit that linkage in its data.
   * *Privacy/Access (if applicable)*: perhaps a toggle if the idea is meant to be private or restricted. (GI2MO’s `AccessType` could define if an idea is public or confidential, but for now, assume all submissions are within the community and visible).
3. **Submit:** The user submits the form. The app validates required fields (title, description at minimum). On submission:

   * The idea is saved to the data store (if using GitHub, a new Issue is created via API in the designated repo, with the title, description, etc., and labeled with the contest or categories as appropriate – or the app’s internal state is updated and the JSON store is appended).
   * The idea’s initial **Status** is set to “Submitted” (or perhaps “Draft” if the user saved without officially submitting – though typically hitting the submit button means it’s active). The GI2MO model considers an idea an instance once in the system, and status can track if it’s under consideration or implemented, etc.
   * The idea is assigned a unique ID. If using GitHub Issues, the issue number or ID can serve as this.
   * If notifications are configured, the system could notify relevant managers or reviewers of the new submission (e.g. by triggering an email or a GitHub notification).
4. **Confirmation:** The user sees a confirmation (e.g. “Your idea has been submitted!”) along with perhaps the unique ID or link to the idea page. The idea now appears in the list of ideas for others (with appropriate filtering if contests or categories).
5. **Post-Submission Editing:** By default, the idea contributor can edit their idea’s details for a certain period or while it’s in Draft. If the system allows drafts, an idea might remain in “Draft” status visible only to the author until they mark it final. For simplicity, we may allow editing of description/tags until the idea is picked for review. The app will version control changes behind the scenes (if using GitHub, editing might mean updating the issue or adding a comment with changes). GI2MO can accommodate version info for ideas via its versioning properties, but we likely implement a simpler edit history or none at all beyond latest values.

The outcome of this workflow is a new Idea record in the system with status submitted. It’s now ready to be **seen by others, commented on, and evaluated**. This stage is entirely user-driven and open – the goal is to capture as many ideas as possible in structured form.

### 2. Idea Browsing & Discussion Workflow

Once ideas are in the system, users and stakeholders will browse and discuss them. This is an ongoing, largely unstructured workflow that encourages collaboration and refinement of ideas.

**Participants:** All users (Contributors, Reviewers, Managers, even Project team members can observe ideas before they become projects).

**Key Features in this workflow:**

* **Browse Ideas:** The app provides an “All Ideas” page where users can see a list of submitted ideas. This list can be filtered or sorted by various criteria:

  * *By Contest*: filter to ideas within a specific campaign (e.g. only show ideas from “2025 Challenge”).
  * *By Category/Tag*: filter to a topic (e.g. show all ideas tagged “Customer Experience”).
  * *By Status*: e.g. see only “Under Review” ideas or “Implemented” ideas to learn from past success.
  * *By submitter or date*: search by keyword, or sort by newest, most discussed, highest rated, etc.
    This page is essentially reading from the Idea data store and presenting a summarized card for each idea (title, a snippet of description, maybe number of comments or votes, status label).
* **Idea Detail & Comments:** When a user clicks an idea, they go to the Idea Detail page. Here, all the information about the idea is shown:

  * Title, author, submission date, status.
  * Full description (and any sub-sections).
  * Category tags, contest info.
  * Attachments (download/view links).
  * A **comments section** where users can post comments or questions about the idea. This uses the Comment model described earlier. Users can add a new comment (which appears with their name and timestamp). This fosters discussion – for example, someone might ask the submitter for clarification, or suggest improvements. The submitter or others can reply via additional comments. The UI might thread these or just list them in chronological order.
  * Possibly a display of any **reviews/ratings** (if reviews have been done, see Evaluation workflow, those might also show up here or in a dedicated tab).
  * If the user viewing has permission to edit or manage the idea (e.g. the submitter or an admin), there may be controls for editing the description, adding tags, or changing status (for admins).
* **Voting (optional):** Some idea systems allow all users to vote or upvote ideas (crowdsourced voting). If we implement a simple voting, on the idea detail (or even the idea list), there could be an “Upvote” button or star rating that any logged-in user can click. The total vote count or average rating would be displayed. This is considered a kind of informal review by the crowd. GI2MO’s model can handle this as individual Review instances or as an aggregate “score” on the idea. The app can treat it as a property (e.g. idea has a score or upvote count) or explicitly log each vote as a lightweight Review object. For performance, likely just store a count and a user-voted flag to prevent multiple votes. This voting feature can be toggled by the innovation manager.
* **Social Functions:** The app might include features like bookmarking favorite ideas, sharing a link to an idea (links can be shared since the app can be accessed read-only by others if allowed), or watching an idea for updates. These are auxiliary but improve engagement. They don’t have direct GI2MO equivalents but fit in the user experience.

Throughout browsing and discussion, **all users are essentially in feedback mode**. No idea is decided yet; everything is about clarifying and improving ideas. Innovation Managers monitor discussions and can intervene if needed (e.g. remove inappropriate comments or highlight trending ideas). This stage is continuous and overlaps with evaluation timing – discussions might influence evaluators or might surface community sentiment.

### 3. Idea Clustering & Organization Workflow

As the number of ideas grows, the Innovation Manager(s) will regularly organize and cluster ideas to make evaluation manageable. This involves identifying duplicates, grouping similar ideas, and ensuring each idea is categorized correctly.

**Participants:** Primarily Innovation Manager (Admin/Moderator role). Contributors may assist by tagging their ideas appropriately, but only moderators will have the authority to officially merge or link ideas.

**Steps/Activities:**

* **Duplicate Detection:** The manager reviews new submissions and checks for duplicates. When two ideas are very similar or essentially the same suggestion submitted by different people, the manager can mark one as a duplicate:

  * In the UI, the manager might use a “Mark as Duplicate” action on an idea detail page. This opens a dialog to choose which idea it duplicates (e.g. search or pick from list of ideas). Once confirmed, the system links the ideas via the *hasDuplicate* property. The duplicate idea might automatically get a status like “Duplicate/Merged” and no longer appear in main lists (or appears with a badge “Duplicate of \[Idea X]”). Users who visit it can be redirected or shown a note that it’s merged with the other idea.
  * Optionally, the content of the duplicate could be appended as a comment to the primary idea for reference or the submitter of duplicate might be listed as co-contributor.
* **Merging Ideas:** In cases where ideas are complementary or could be merged into a bigger idea (not strictly duplicates but one could be part of another), the manager could use relationships like *generalizes/details* (one idea is a broader concept that includes the other). The UI might offer “Merge” or “Relate idea” functions. Practically, merging might simply be handled by linking ideas as related and possibly combining their descriptions manually. (Full automatic merging is tricky, so likely the admin would close one idea and edit the other to incorporate its content, while referencing it.)
* **Tagging and Category Maintenance:** Managers ensure each idea has proper category tags. They might add tags to ideas or correct misclassified ones. They can also create new categories if they notice a new theme emerging. E.g., if 10 ideas about “AI” come in and no such category existed, they add an “AI” category and tag those ideas accordingly. This taxonomy update might be reflected in the GI2MO concept scheme (in a future advanced version, adding a SKOS concept) – in practice, just updating the categories JSON and perhaps labeling existing ideas.
* **Grouping by Similarity:** Even if not duplicates, similar ideas can be grouped. The UI could allow the admin to create a cluster or label ideas as related (the *describesSameObject/hasSimilar* relation). For example, five ideas all about improving the login process can be linked as a cluster “Login improvements”. The system might allow a custom label or just show the interlink. In the interface, viewing one idea could show “Similar Ideas: \[list of linked ideas]”. This helps evaluators to consider them together or possibly to combine them.
* **Idea Contest Allocation:** If an idea was submitted without a contest but actually fits one, the admin can assign it to a contest (e.g. someone submitted in general pool but it is relevant to an ongoing campaign, the admin edits the idea to attach it to that contest). Conversely, if someone mis-filed into a contest, admin can move it out or to the correct one.
* **Prioritization/Grouping for Evaluation:** The manager may also organize ideas by priority or batch for evaluation. For instance, in a large system, an admin might mark certain ideas as “Ready for review” or assign them to specific reviewers (e.g. idea A to Team Alpha, idea B to Team Beta). While GI2MO doesn’t explicitly define an assignment property, this can be managed via tags or a simple internal mapping. The app might have an interface for admins to batch assign ideas to reviewers (especially if integrating with GitHub, could assign issues to users as a way of saying “you review this”).

The result of the clustering phase is an organized set of ideas: duplicates weeded out, ideas grouped by theme, and properly tagged. This ensures the **evaluation phase** that follows is more effective, since evaluators will likely have a clean list of unique ideas to assess, often organized by contest or category.

### 4. Idea Evaluation Workflow

In this phase, designated reviewers (or in some cases all users via voting) evaluate the ideas against certain criteria to inform selection decisions.

**Participants:** Reviewers/Evaluators (could be managers, subject experts, or a review committee); Innovation Manager (to oversee the process); Contributors (passively, they can see their ideas being reviewed, but typically they don’t review their own ideas).

**Process:**

* **Assignment of Ideas to Reviewers:** If not already done in clustering, the admin assigns ideas to reviewers. In a small scenario, all reviewers might evaluate all ideas. In a larger scenario, each idea or contest might have a panel of reviewers. The app can present each reviewer with a personalized list: “Ideas to Review” (possibly accessible via a dashboard or a filter like “Assigned to me”).
* **Review Form:** For each idea requiring evaluation, a reviewer opens the idea’s page and sees an **evaluation form** (likely in a tab or collapsible section separate from general comments). The form may include:

  * **Rating scales for criteria:** e.g. 1-5 or 1-10 scales on dimensions like *Impact*, *Feasibility*, *Novelty*, *Cost*. These criteria can be configured by the manager at contest creation or globally. For initial simplicity, we might use a single overall score or a couple of standard criteria.
  * **Textual feedback field:** where the reviewer can write an overall assessment (this corresponds to GI2MO’s TextualReview content).
  * **Recommendation**: perhaps a dropdown like “Strongly Recommend / Neutral / Do Not Recommend” as a summary judgment.
  * The form auto-saves or at least can be submitted once. If multiple reviewers are collaborating, they each fill out their own form (the app will create separate Review entries per reviewer).
* **Submitting a Review:** When the reviewer submits their evaluation:

  * The data is stored as a **Review** object linked to the idea. If using GitHub as backend, this might be posted as a special comment (or a structured data blob in the issue comments or an external data store) because GitHub doesn’t have first-class “review” concept for issues. Alternatively, the app could maintain a separate JSON in the repo for reviews. In any case, it’s recorded for later retrieval.
  * The app might immediately update an aggregate score for the idea. For instance, if 3 out of 5 reviews are in, it could show an average rating. GI2MO’s guidance allows treating a Review instance as either individual or aggregate. We’ll compute aggregates on the fly: e.g., calculate average of numeric scores, count of positive recommendations, etc.
  * The reviewer’s identity is stored with the review. If the app is configured to anonymize reviews (maybe not needed internally, but if that was a requirement, it could hide names).
* **Tracking Review Progress:** Managers can monitor which ideas have how many reviews done. The UI for admins might show a dashboard per contest: e.g., “30 ideas – each should get 3 reviews – progress: Idea 1 (3/3 done), Idea 2 (2/3 done)….”. This helps ensure all ideas get evaluated. The system might highlight overdue reviews or ping reviewers via email (if we had that feature; since GH Pages won’t send emails by itself, this could rely on GitHub notifications or manual tracking).
* **Community Voting:** In parallel or as an alternative, if the app has community voting enabled, the number of upvotes an idea has accumulated can be considered a part of evaluation. The manager may look at vote counts as a metric of popularity. We might include that as an automatic “Community Score” in evaluation results.
* **Review Results Visibility:** Once reviews are submitted, who can see them?

  * Possibly, the idea author and all users might see an **aggregate result** (like average scores or a badge like “Top Rated Idea”). Detailed reviews (especially textual feedback) might either be public or only visible to managers and the author until final results. It depends on the use case – some programs keep evaluations confidential to avoid politics, others share feedback with submitters. Our spec will assume that after selection, some feedback can be shared, but during evaluation, the detailed scores are visible only to managers to maintain fairness. However, we may show that an idea is “Under Review” and maybe percentage completed of reviews, etc.
  * The admin interface can show all raw review data.
* **Scoring and Ranking:** As evaluations come in, the system can **rank ideas** within a contest or category. The app might provide a view like “Sort by highest score” or show a leaderboard of ideas. This is dynamic and helps decision-makers see which ideas are bubbling to the top. We will implement sorting by aggregate score and possibly a visual indicator (like a 5-star graphic or score out of 100).
* **Feedback Loop:** Optionally, if an idea is scoring poorly on some criteria, managers could decide to send it back to the submitter for clarifications (this would be a custom workflow: e.g., change status to “Needs more info” and ask the submitter to update the idea). This is not a core flow but can be done informally via comments and status changes.

This evaluation phase culminates in each idea having a set of reviews or a score profile, which directly feeds into the next workflow: selection. By the end of the evaluation period, the innovation manager or decision committee should have sufficient information (review scores, comments, plus the initial idea details and discussion) to decide which ideas to fund or implement.

### 5. Idea Selection & Project Initiation Workflow

After evaluations, the organization must decide which ideas will be pursued. This workflow covers selecting top ideas and kicking off their transition into projects.

**Participants:** Innovation Manager(s) and potentially a leadership committee (could be represented by the admin making final changes in the app). Idea submitters are informed of outcomes but do not choose directly.

**Steps:**

1. **Review Evaluation Outcomes:** Managers look at the evaluated ideas, typically contest by contest or category. They may use a **“Selection Dashboard”** in the app that presents each idea with its key metrics: average score, number of votes, number of comments, etc., often sorted by score or flagged by contest winners. For instance, if a contest was “Top Idea for Q1”, the admin sees the highest scoring ideas in that contest.
2. **Final Deliberation:** Possibly outside the app (in meetings), decision-makers decide which ideas to approve. They might consider evaluation scores, strategic alignment, budget, etc. The app can assist by allowing the manager to mark some ideas as “shortlisted”. There could be a multi-select or a checkbox list to pick the finalists.
3. **Mark Idea as Selected:** For each idea chosen for implementation, the manager updates its **Idea Status** to “Selected” (or an equivalent status like “Approved for Implementation”). This can be done via an action on the idea’s page or the selection dashboard (e.g. a “Approve Idea” button). When clicked:

   * The idea’s status field changes from Submitted/Reviewed to Selected.
   * The UI may visually highlight the idea as a winner (e.g. add a trophy icon or highlight).
   * If the contest had a notion of a single winner or top 3, those can be explicitly flagged (the manager might set “Winner = Yes” on one idea, or assign a rank).
   * The app might automatically notify the idea submitter (e.g. via email or if GitHub, by commenting on the issue tagging them and saying “Congratulations, your idea has been selected!”).
   * Non-selected ideas can be marked as “Closed” or “Not Selected” (some remain maybe for future consideration).
4. **Initiate Project:** Upon selecting an idea, the manager (or the system) initiates the creation of a **Project** entity linked to that idea:

   * In the simplest form, the app creates a new Project record in its data store, populating it with info from the idea (title, description, author).
   * The manager is prompted to fill additional project fields: e.g. assign a Project Owner (maybe themselves or someone from a drop-down list of users), set a start date, choose a repository or GitHub project integration if applicable.
   * If integration with GitHub Projects is enabled, this step could create a **GitHub Project** board or a new repository:

     * For example, using GitHub’s API to create a project (especially if using the new GitHub Projects Beta which is more like a table of issues) or at least to create a new GitHub Issue label/milestone to track tasks. However, given GitHub’s evolving project API, maybe a simpler approach: create a new repository for the project and link the idea issue to it.
     * Alternatively, just record the intention to integrate: store a placeholder for “GitHub Project URL” in the Project data. The manager can manually set up external project tracking and paste a link.
   * The Project is now an active object. The idea and project remain linked: in the idea’s record, we can store a pointer to the project (so that if someone visits the idea, they see “Status: Selected – now being implemented as Project XYZ” and a link to the project page).
   * The idea’s status might automatically update further to “Implemented” when the project is completed; that comes later.
5. **Announce Results:** The app can support publishing the results of a contest or selection round. For instance, on the contest page, the manager can toggle it to “Closed” and list the winning ideas and their next steps. This way, contributors know which ideas were accepted. If the app has a homepage or news section, an announcement can be posted (the manager would just manually create a news item or the app could generate one from selection data).
6. **Closing Out Others:** Non-selected ideas get a final status update. Possibly “Rejected” or simply remain in the pool for future. The manager could choose to archive some. The app should make it easy to filter out those from active consideration going forward (maybe an Archive function to hide them from default view, though still searchable).

At the end of this workflow, we have one or more **Project**s created, each tied to an original idea. This bridges us into the project execution phase. The critical outcome is that the chosen ideas have been formally handed off to implementation with a clear record and owner.

### 6. Project Execution & Tracking Workflow (Foundational Support)

This phase extends beyond idea management into actual project management. Our app provides basic features to monitor and update the execution status of projects initiated from ideas, but it is not intended to replace full project management tools. Instead, it either integrates with them or offers a lightweight tracking mechanism.

**Participants:** Project Owner/Team (primarily responsible for updating project progress), Innovation Manager (oversight), possibly general users (to view progress updates).

**Features and Steps:**

* **Project Dashboard:** The app will have a section listing all active Projects (those created from selected ideas). Each entry shows:

  * Project name, linked idea, owner, current status (e.g. In Progress).
  * Perhaps a progress indicator (if we track percentage complete or milestone).
  * Possibly the target end date or days remaining.
  * If integrated with GitHub, maybe a snapshot of how many GitHub issues closed / open in the project’s repo (if available via API).
* **Project Detail Page:** Clicking a project opens its detail page, which includes:

  * Basic info (same as above: name, description, owner, linked idea reference).
  * The original idea’s summary for context (so project team remembers the initial concept).
  * **Task List / Kanban:** If no integration, the app can provide a simple task list. For example, a checklist that the project owner can edit: they can add tasks (just text), mark them complete, and re-order them. This is stored as part of the project data. It’s not as powerful as Jira or GitHub Issues, but it gives a sense of progress.

    * If integrated with GitHub Projects: Instead of a manual list, the app could fetch the list of issues from the linked GitHub repository or project board. It could display them and their status (open/closed). The UI might not allow editing here (users would go to GitHub to manage tasks) unless we implement issue creation from the app. Since requirement is not to fully integrate, we likely won’t implement full two-way issue editing, but we “anticipate” it – meaning the architecture allows adding that later by making an API call to create a GitHub issue if we wanted.
    * We leave hooks such as maybe a button “Open Project Board” that navigates to an external board if configured.
  * **Milestones/Phases:** We might allow defining a few milestones with dates (for instance, Prototype Ready, Pilot Test, Final Launch). The project owner can set these and update as they pass. This is just informational tracking.
  * **Status Updates:** The project owner or team can post updates (similar to comments, but specifically for progress). E.g. “Q2: completed user testing.” These updates can be timestamped and possibly appear in a timeline. This keeps stakeholders informed. If integrated with GitHub, one might use issues or commit messages on GitHub to reflect progress, but our app can have its own update feed.
  * **Link to Idea Discussion:** The project detail page should link back to the original idea’s page (which likely is now in a closed state with status Implemented). This allows anyone following the idea to jump to see the project in action.
  * **Link to External Tools:** If an external repository or project management tool is being used (which is common), the project page should display those links clearly (e.g. “GitHub Repository: <link>”, “Jira Board: <link>” if someone put it).
* **Updates and Completion:** As the project progresses, the project owner updates the tasks and status:

  * They can change the **Project Status** field from Not Started to In Progress, etc., up to Completed when done.
  * Once a project is marked Completed (and verified by the manager if needed), the app can automatically update the linked idea’s status to **Implemented/Deployed** (meaning the idea has come to fruition). This closes the loop for that idea.
  * Possibly, the manager can then move the project (and idea) to an archive of completed projects, or leave it visible in a “Completed Projects” section for record-keeping and knowledge base purposes.
* **Limited Scope:** The app will *not* handle detailed resource management, Gantt charts, or complex team collaboration – those are out of scope. Instead, it provides a **lightweight view** of the project to maintain continuity from idea to implementation. It ensures that the idea originators and other stakeholders can see what became of the idea (preventing the “black hole” problem where ideas get approved and then nothing is heard).
* **Integration hooks:**

  * If deeper integration is later required, the system is ready to incorporate it. For example, a future feature could automatically create GitHub issues for each task entered, or sync status updates with commit messages. We design the data model such that each Project can have an external ID (like a GitHub Project ID or Jira ID) and the code to sync would be contained in one module.
  * Webhooks could be set up if a backend existed to catch external changes (not possible in pure GH Pages without external servers, but a GitHub Action could be employed if needed to reflect external changes into the static data).

In summary, the project execution workflow in our app is kept simple but functional. It provides transparency and a basic level of tracking. The main goal is to **close the innovation loop**: the app started with collecting ideas, and ends with showing how those ideas turned into real outcomes (projects completed). This fosters trust in the innovation process and encourages future participation (users see that selected ideas do get implemented and tracked).

## User Interface Components

The user interface is designed to be intuitive and to reflect the data and workflows described. This section outlines the key UI components and screens, describing their purpose and elements. Each component is built mobile-friendly (responsive) and accessible. We also leverage the ontology to drive UI labels and forms (for example, knowing an Idea has certain properties to display). Here are the primary UI components:

### Idea Submission Form

&#x20;*Figure: New Idea Submission form – users enter details like title, description, categories, and attach files.*
The **Idea Submission Form** allows users to input a new idea. It is typically accessed via a “Submit Idea” button. Key elements of this form include:

* **Form Fields:** Clearly labeled input fields for Title (single line text), Description (multi-line textarea, potentially with a rich text editor for formatting). If the submission requires multiple structured fields (like separate problem/solution fields), these are provided as well.
* **Category Selector:** A dropdown or tag selector that lists available idea categories (topics). Users can pick one or multiple. The categories are fetched from the taxonomy defined by admins.
* **Contest Selector:** (Visible if at least one contest is open) – e.g. a radio button or dropdown: “Is this idea for a specific challenge? \[General Submission] or \[Contest XYZ]”. This ensures the idea is linked to a contest if applicable.
* **Attachments Upload:** An interface to attach files or links. Because of GH Pages constraints, instead of direct file upload to server, this might be an “Add link” feature. Alternatively, if we integrate with GitHub, we could use the GitHub API to upload an image to an issue comment. A simpler approach is: user provides a URL (from their cloud drive, etc.) and the app will embed it. In any case, the UI provides an “Attach file or link” button, and shows a list of attachments added (with remove option).
* **Submit/Save Buttons:** A “Submit Idea” button to finalize. Optionally a “Save Draft” if drafts are supported (which would allow returning later to edit before final submit).
* **Client-side Validation and Guidance:** The form validates required fields (e.g., Title cannot be blank, Description minimum length). It may also show guidance like “Make sure your idea is clear and describes the problem and solution.”

When the user submits, the UI gives feedback (e.g. highlights missing fields in red, then on success, either navigates to the new Idea page or shows a success message). The design is straightforward and focused on lowering the barrier to submission – minimal required fields at first, with ability to add more details after submission if needed.

### Ideas List & Browsing Page

The **Ideas List** page is the main directory of all ideas (or filtered subset). Its UI includes:

* **Filters Panel:** On top or side, filters for Contest, Category, Status, and maybe a search bar for keywords. For example, a user can select a contest from a dropdown to only see those ideas, or type “database” in search to find ideas mentioning that.
* **Sort Options:** Sort by newest, most popular (by votes/comments), highest rated (if reviews are public), or alphabetically.
* **Idea Cards/Table:** The ideas can be displayed as cards in a grid or as a sortable table list. Each entry typically shows:

  * Title of the idea (clickable to detail).
  * A short snippet of the description or a tagline.
  * Submitter name and submission date.
  * Status badge (color-coded label like “Under Review”, “Selected” etc.).
  * Perhaps small icons or counts for comments and votes (e.g. 💬 5 comments, ⭐ 12 votes).
  * If grouped by contest, maybe a label of the contest name on each card or separated by headings.
  * If an idea is selected or implemented, maybe a special icon (🏆 for winners, checkmark for implemented).
* **Pagination or Load More:** If there are many ideas, they can be paginated or lazy-loaded.

The list page allows all users to discover ideas. It is essentially read-only (except for filter controls) for most users. Admins might have additional controls here, like a button on each idea card for quick actions (e.g. change status, assign reviewer, but those could also be inside detail page).

### Idea Detail & Discussion Page

This page is central to collaboration on an idea. It typically has a two-column layout: main content (idea details) on the left, and a sidebar with meta-info on the right – or a single column with sections.

Main content section includes:

* **Idea Title** – as a header.
* **Idea Metadata:** underneath the title, show key info like Author (with avatar), Date submitted, Status (in a pill badge form). If it’s part of a contest, show “Submitted to: Contest Name”. If it has categories, show them as tags.
* **Description:** The full description text, possibly formatted (the app might auto-link URLs, allow basic markdown, etc.). If there were structured fields (e.g. separate “Benefit” section), each could be a sub-section here.
* **Attachments Preview:** If attachments exist, show them (for example, images could be displayed as thumbnails inline; documents as file icons with name). Users can click to view/download.
* **Related Ideas:** If any similar or duplicate relationships exist, this section lists and links those ideas. For instance, “Similar Ideas: Idea 42 (Improve Login UX), Idea 87 (Password Reset Process)” as hyperlinks. This implements the GI2MO relationships – helpful for users to explore clusters. Duplicates might be indicated as such (“This idea was marked as a duplicate of Idea 42”) with a link.
* **Comments Discussion:** A chronological list of comments on the idea:

  * Each comment shows commenter name, timestamp, and text. Possibly allow threading (reply to specific comment) but that can be a future enhancement.
  * If the commenter is an admin or the idea author, could have a badge (e.g. “Author” or “Moderator” next to their name for context).
  * At the bottom of comments list is a **New Comment** box for logged-in users to add their comment. Very similar to an issue tracker comment box – supports text (maybe markdown), posting via a button. If using GitHub as backend, posting a comment would call the GitHub API to create an issue comment.

Sidebar or info panel might include:

* **Idea Status & Actions (for authorized users):** For admins, a dropdown or buttons to change status (e.g. a button “Approve Idea” or “Reject Idea” – which essentially updates status and triggers selection workflow). Also, “Edit Idea” (if needed to fix details).
* **Voting widget (for all users if enabled):** e.g. a thumbs-up icon that users can click to upvote, with a counter of votes. If a user has already voted, the icon might be highlighted.
* **Review Summary:** If the evaluation phase is done and if results are to be shown, this panel could show an average score or a small breakdown (e.g., “Average Reviewer Score: 8.2/10”, “Recommendation: 3 out of 5 reviewers recommend implementation”). It might also show the list of criteria with their averages if applicable.
* **Contest Info:** If in a contest, maybe a countdown “X days left in contest” (if contest still open), or “Contest Winner” label if it won.
* **External links:** For example, if idea relates to a forum discussion or an existing issue elsewhere, those could be linked here by the admin.

Overall, the Idea Detail page is the most content-rich and interactive part of the UI, where all roles converge: contributors see their idea’s reception, peers discuss it, reviewers see where to enter evaluations (if they have that role, see next).

### Idea Evaluation Interface (Reviewer view)

For users with the Reviewer role, the idea detail page will include an additional section (not visible to normal users): the **Evaluation Form**. This can be implemented as either:

* A collapsible panel on the idea page (e.g. a tab “Evaluate” next to “Discussion”), OR
* A separate page/modal accessible via a “Evaluate this Idea” button (which might provide a focused form).

In the evaluation interface:

* If the reviewer has not yet submitted a review for this idea, they see input controls to do so (score sliders or dropdowns, comment box, etc., as described in the evaluation workflow).
* If they have submitted, they may see their submitted scores/comments (and possibly edit if allowed).
* They might also see aggregate results so far if that’s allowed (e.g., “Current average score = X” or “Your colleagues’ average rating is Y” – although some processes keep individual scores hidden to avoid bias).
* A “Submit Review” button to save the evaluation. If multiple criteria are used, each could be a slider (with numeric output displayed).
* The design should make it efficient to go through many ideas: possibly provide “Next idea” navigation for reviewers, so after saving one, they can jump to the next assigned idea without going back to the list manually.

We ensure the evaluation UI is user-friendly, since clunky evaluation forms can deter thorough reviews. Use of stars, sliders, or radio buttons for scoring will be considered to make input quick. The textual feedback field will be large enough to encourage meaningful comments.

### Administration Dashboard

For Innovation Managers, an admin dashboard provides oversight and management capabilities. This might be split into multiple screens or one consolidated view with tabs for different functions:

* **Ideas Management:** A table of all ideas with columns for status, number of reviews, etc. Admin can filter by contest or status to see e.g. all “Submitted” ideas pending review. Inline actions might allow quick status changes or assignments.
* **Contests Management:** A section where admins can create new contests or edit existing ones. A form to define contest name, description, time window, etc., and perhaps add contest-specific evaluation criteria. They can close contests (which might trigger that contest’s ideas to no longer accept new entries).
* **Categories Management:** A simple interface to add/edit categories (the taxonomy). E.g. an admin can add a new category name and maybe a description, and it updates the underlying data. They can also delete/merge categories (with caution, since ideas tagged with them need updating).
* **User & Roles Management:** Possibly a panel listing current users and their roles. In a GitHub-auth integrated setup, this might simply show who logged in and allow promoting someone to reviewer or admin by whitelisting their username (though often roles are determined outside the app). If not integrated, admin might manually create users or assign roles. Given GH Pages, likely we offload user management to GitHub (i.e., whoever can log in with org credentials is a normal user, and we designate certain usernames as admins in a config file).
* **System Settings:** Config options like enabling/disabling voting, integration tokens for GitHub (the admin might input a GitHub API token here to allow the app to create issues on their behalf – though better is user’s own tokens via OAuth, but some admin actions might use a stored token if needed).
* **Analytics/Reports:** The admin dashboard might show some stats: number of ideas submitted, number of active users, etc., to gauge engagement. It could also highlight “trending” ideas (most commented or voted) for admin attention.

This admin interface ensures managers can conduct the clustering, moderation, and selection tasks described earlier, with appropriate tools rather than raw data editing.

### Project Dashboard & Project Detail

As described in the project workflow, the UI for projects includes:

* **Projects Dashboard:** A page listing projects, possibly a simple table with columns: Project Name, Linked Idea, Owner, Status, % Complete. Each row linking to detail. This page is mostly for managers or project owners; normal idea contributors might not have projects unless they are also implementers.
* **Project Detail:** Showing project info and containing interactive elements:

  * The task list with add/edit capabilities (for project team).
  * Status drop-down to update project stage (for project owner or admin).
  * Field to update progress % or mark project complete.
  * The timeline of status updates (like a mini changelog).
  * Links to external tools (if provided).
  * Possibly a section for project-specific attachments or documents (e.g. final report, or deliverables).
  * A button to mark project finished, which triggers the closure routines (like updating idea status).

The project UI is simpler compared to the idea UI, as it’s more about tracking and less about discussion or evaluation. It will, however, maintain the same look-and-feel so users realize it’s part of the same system.

### Responsive and Accessibility Considerations

All pages will be responsive to work on mobile devices, given many users might submit or discuss ideas on the go. The layout will collapse sidebars into accordions, etc., for narrow screens. We also ensure proper contrast and support screen readers (adding appropriate ARIA labels, etc., for form fields and dynamic content) to accommodate accessibility needs.

### Visual Design

The app’s visual design will be clean and modern, using perhaps a design framework (like Bootstrap or Material UI if React) to expedite development. GI2MO ontology doesn’t mandate visuals, but it gives content structure which we have leveraged. For example, different GI2MO classes could be indicated with distinct icons:

* Idea icon (lightbulb),
* Contest icon (trophy or campaign flag),
* Review icon (checkmark or star),
* Project icon (clipboard or rocket for launch), etc.
  These help users quickly identify sections of the app.

Color coding will be used for statuses (e.g. grey for draft, blue for submitted, green for approved, red for rejected) to draw attention accordingly.

No matter the aesthetics, the UI serves to guide users through the innovation process seamlessly, encouraging participation and making data (ideas, reviews, progress) easy to understand.

*(Figure above illustrates the idea submission form with sample inputs. Additional UI mockups would similarly outline the idea list and idea detail layouts in a full design document.)*

## API Endpoints and Integration Interfaces

While the app is primarily client-side, we define a set of **API endpoints** as if the app had a backend or to describe interactions with external services (notably GitHub’s API). These endpoints encapsulate the actions the app needs to perform on data. In a GitHub Pages context, these might correspond to GitHub REST calls or be notional endpoints for a future server. Defining them ensures clarity on data flow and can guide the implementation of GitHub API calls.

Below is a list of key API endpoints (or their equivalent operations) and their purpose:

* **Ideas:**

  * `GET /ideas` – Retrieve list of all ideas (with optional query parameters for filtering by status, category, contest, etc.). **Response:** List of idea objects (ID, title, summary, status, etc.). In GitHub integration, this may translate to fetching issues via GitHub API (e.g. issues list endpoint filtered by labels for contest/status).
  * `POST /ideas` – Submit a new idea. **Request:** Idea data (title, description, category, contest, attachments). **Response:** Created idea object with assigned ID. In GH integration, this corresponds to creating a new issue (GitHub API `POST /repos/:owner/:repo/issues`).
  * `GET /ideas/{id}` – Get detailed info for a specific idea. **Response:** Full idea data (including all fields, and possibly embedded lists of comments, reviews if not using separate endpoints). In GH terms, fetch a single issue and perhaps related comments.
  * `PUT /ideas/{id}` – Update an idea (e.g. edit description or category). Restricted to permitted roles (author or admin). **Request:** Changed fields. **Response:** Updated idea. (On GH, this would be `PATCH /repos/:owner/:repo/issues/:issue_number` to edit title/body/labels.)
  * `DELETE /ideas/{id}` – Remove an idea. Likely only used if an admin wants to delete spam or such. Normally not exposed to UI except admin actions. (In GH, could close the issue and perhaps label as deleted; permanent deletion of issues is not typical, so might just mark as removed in our data.)

* **Idea Status & Lifecycle:**

  * `POST /ideas/{id}/status` – Change the status of an idea. **Request:** New status value (e.g. “Selected”). **Response:** Idea with status updated. Only admins use this. (On GH, this might equate to adding a label like “Selected” or leaving a comment that status changed – or using a specific field if we had one. We might also manage status in the issue’s labels or a project column in GH integration scenario.)
  * Alternatively, status change can be done via the general update endpoint (PUT) if we treat status as just another field. But a dedicated endpoint makes auditing and permission clearer.

* **Comments:**

  * `GET /ideas/{id}/comments` – Retrieve all comments on an idea. **Response:** list of comment objects (with author, text, timestamp). (In GH, `GET /issues/:issue_number/comments`).
  * `POST /ideas/{id}/comments` – Add a new comment to an idea. **Request:** comment text (the user info is taken from auth context). **Response:** created comment object (with ID, timestamp). (Maps to `POST /issues/:issue_number/comments` in GH.)
  * `DELETE /comments/{comment_id}` – Remove a comment (admin only, for moderation). (GH offers comment delete for authorized users via `DELETE /repos/:owner/:repo/issues/comments/:comment_id`).
  * No update comment (editing) via API is needed unless we allow users to edit their comment; if so, would be `PATCH /comments/{id}`.

* **Reviews:**

  * `GET /ideas/{id}/reviews` – Get all reviews for an idea (admin or reviewer access likely). **Response:** list of review objects (with scores, reviewer id, etc.).
  * `POST /ideas/{id}/reviews` – Submit a new review for an idea. **Request:** review data (could include numeric scores for criteria and text feedback). **Response:** created review object. This is restricted to users with reviewer role (the API or client will enforce). If one user tries to post multiple reviews for the same idea, the server might either overwrite or reject duplicates (ensuring one review per user per idea). (There is no direct GH analog, so likely stored via some workaround: e.g. as a special comment or in a JSON file; we might eventually use GitHub Discussions or a separate reviews file in the repo that the app commits to via GH API.)
  * `PUT /reviews/{id}` – Update a review (if we allow reviewers to modify their evaluation before a deadline). Or this could simply be achieved by POSTing again and the system using latest.
  * Note: If reviews are stored as issue comments with special formatting, the app would parse them rather than having a separate endpoint. But conceptually, this is how it’s structured.

* **Idea Contests:**

  * `GET /contests` – List all idea contests (active or all). **Response:** list of contests (with id, name, status open/closed, date range). Possibly include basic stats like number of ideas in each.
  * `POST /contests` – Create a new contest (admin only). **Request:** contest data (name, description, start/end date, criteria perhaps). **Response:** created contest object. (Without a custom backend, this might be editing a JSON or a config in the repository. Could be done through GitHub by creating an issue labeled as contest or using a separate file that admin edits through the UI and commits via API.)
  * `GET /contests/{id}` – Get details of one contest, including the list of ideas under it (or that could be another endpoint: see next).
  * `GET /contests/{id}/ideas` – Get all ideas belonging to a specific contest (could also use the general ideas endpoint with a filter parameter contest\_id).
  * `PUT /contests/{id}` – Update contest info (admin only; e.g. mark it closed, or extend deadline).
  * We may not need delete contest via API; contests can be closed but rarely deleted (if needed, an admin can remove via config).

* **Categories/Taxonomy:**

  * `GET /categories` – Get list of all categories (each with an ID, name, maybe description).
  * `POST /categories` – Create a new category (admin).
  * `DELETE /categories/{id}` – Delete a category (admin). (In practice, careful with this as it might orphan tags on ideas; the UI might prevent deleting if in use or reassign those ideas to “Uncategorized”).
  * In GH integration scenario, categories could be represented by GitHub labels. So `GET /categories` might map to `GET /repos/:owner/:repo/labels`. Creating a category might create a new label via GitHub API.

* **Projects:**

  * `GET /projects` – List all projects (or perhaps split into active vs completed). **Response:** list of project objects (id, name, linked idea id, status, owner).
  * `POST /projects` – Create a new project. **Request:** project data (likely triggered automatically when selecting an idea, so not a public endpoint but an internal call).
  * `GET /projects/{id}` – Get project details, including fields and maybe the list of tasks/updates. If integrated, could also include data from external source (like number of open issues from GH).
  * `PUT /projects/{id}` – Update project info. Used by project owners to update status, add tasks (the tasks could be a field in the JSON, or we might have sub-endpoints: see below).
  * `DELETE /projects/{id}` – Remove or archive a project (maybe if canceled). Usually not needed; instead mark status as canceled.
  * **Project tasks:** If we treat tasks as sub-resources, endpoints could be: `POST /projects/{id}/tasks` to add a task, `PUT /projects/{id}/tasks/{taskid}` to update (like mark complete), etc. But if tasks are just an array field on project, updates to them might go via the main project PUT. For simplicity, at least define that tasks can be manipulated.
  * If integrated with GH, project creation might correspond to making a new repo or project board. We likely won’t do that automatically in first version, but our `POST /projects` is a placeholder for where such integration could be triggered (with appropriate scopes and user confirmation).

* **Authentication & Users:**

  * Since the app relies on GitHub OAuth or similar, we won’t manage a full user database via API. Instead:

    * A route to initiate OAuth (could be a link that redirects to GitHub’s auth URL).
    * GitHub will redirect back with a token; the app picks it up (no server needed if using implicit grant or GitHub Pages allowed flow).
    * The app then uses that token to make API calls on behalf of the user.
    * `GET /user` – (if we had a backend, to get current logged in user profile; but on client, we can directly call GitHub’s `/user` endpoint with token to know who it is).
  * Role management: in absence of a backend, role information might be stored in a configuration JSON mapping GitHub usernames to roles. The app could fetch that and use it. For example, an admin list in a config file, a list of reviewers either in a contest config or globally. So no explicit API, but conceptually: `GET /roles` might return which users are admins or reviewers.

All the above endpoints are conceptual since in a purely static environment, the app will either be performing similar actions against GitHub’s API or manipulating in-memory data. However, by specifying them, we ensure our design covers all operations needed.

For instance, to mark an idea as selected and create a project, the app might internally do:

* Call `POST /projects` (or equivalent GitHub operations) to create the project record.
* Call `POST /ideas/{id}/status` to update idea status.
* In a GH scenario: create a label “Selected” on the issue and perhaps create a new repository (if doing that approach).

**Error handling:** The UI and any API usage will handle cases like:

* Permissions errors (e.g. if a normal user tries an admin endpoint, the app should show an error or hide the option).
* Conflict or validation errors (e.g. duplicate idea title – unlikely to enforce uniqueness, but maybe contests might not want identical submission names; anyway, handle gracefully).
* Network issues (the app should queue actions if offline or inform user to retry, etc., particularly important if GitHub API calls fail – e.g., rate limit exceeded, the app might back off and show a message to try later).

**API Security:** In a full server scenario, we’d secure these endpoints with authentication (session or token) and role-based authorization. In our client-only approach, security relies on the GitHub OAuth token and the user’s GitHub permissions (for example, only an org member might have rights to write to the issues repo, making them effectively an authenticated user in our system). All communications with GitHub’s API are over HTTPS, and tokens are never sent to third parties. If a custom backend was added later, it would implement these endpoints with proper checks.

By having this API contract, we also make it easier to migrate the app to a server-based architecture in the future if needed – the front-end could switch from direct GitHub calls to calling our own API with minimal changes, since we designed the calls it needs.

## GitHub Pages Hosting Constraints & Considerations

Finally, we reiterate the constraints of deploying on GitHub Pages and how the design accommodates them:

* **No Server-Side Code:** All features must execute in the client. This affects things like search and analytics – for example, searching ideas by keyword must be done in the browser (loading all or a portion of data and filtering), since there’s no database query. We optimize by perhaps indexing some data in JSON (like a pre-generated search index if needed for faster lookup). Similarly, sending notifications or emails isn’t possible directly; we rely on GitHub’s built-in notifications (like if using issues, participants get notified through GitHub) or require manual communication for some parts.

* **Data Volume:** Storing potentially many ideas and comments in JSON files could become heavy to load. If the user base is large, the app should fetch data as needed (lazy loading ideas, pagination). We might also use GitHub’s API to only load what’s needed (like only fetch issues in the current filter). However, GitHub’s API has rate limits (typically 60 requests/hour for unauthenticated or higher for auth). We ensure to use authenticated requests for heavy usage, and possibly cache results in the session. If the dataset grows huge, one could introduce an intermediate caching layer or search service (but that would be outside GH Pages realm, so likely not now).

* **Repository Structure:** The GitHub Pages repo itself could hold the source code and maybe some data files (like ontologies, categories, etc.). We might separate the data into a different repo (especially if using issues as data, that could be another private repo while the front-end is public). The spec assumes everything is in one for simplicity.

* **Continuous Deployment:** GitHub Pages can auto-deploy on push. We’ll set up the project such that whenever the code is updated (and possibly data files), the site rebuilds (if using a static site generator or just serving static assets). There’s no special server config needed, which suits the nature of the app.

* **CORS and API Keys:** When the front-end calls GitHub’s API, it must be allowed via CORS. GitHub’s REST API is generally CORS-enabled, so that’s fine. We do need to handle authentication – likely using OAuth implicit flow or PKCE, since we can’t hide a client secret on GH Pages. The user would authorize the app to access necessary scopes (repo for issues, projects for project integration, maybe user/email). After that, the front-end stores the token and uses it. This means an extra step for first-time login, but that’s expected in modern web apps.

* **Limits of GitHub Pages:** GitHub Pages has a strict limit on size of 1GB for the repo and 100MB per file, etc., which we won’t hit with text content. It also has a soft bandwidth limit (100GB/month, 10 builds/hour). Our app’s usage should be well below these unless extremely popular, in which case an upgrade to a more robust hosting or adding a CDN for assets might be needed. We keep images and attachments lean to avoid bloat.

* **Backup & Export:** Since data might be stored in GitHub issues or JSON, one consideration is how to export it if needed. If all in GitHub issues, the data is inherently backed by GitHub. If in JSON, the repo history serves as backup. We can provide an export function (like “Download all ideas as CSV” generated client-side). GI2MO compliance means we could even export in RDF or OWL format for interoperability, which could be a nice advanced feature for organizations that want to integrate with semantic web tools.

* **Privacy:** If the app is published as a public GitHub Pages site, ensure no sensitive info is inadvertently exposed. For internal use, perhaps the repo might be private and served via Pages (private pages for an org). We note that if using a private repo for Pages, that’s allowed with GitHub Enterprise or when using an access token in URLs for assets – but typically GH Pages are public. If privacy is a concern, an alternative could be to host the static site on an internal server or use GitHub Enterprise Pages. This is a deployment consideration beyond the spec’s functional scope, but worth noting.

In conclusion, the design constraints imposed by GitHub Pages have been met by a **client-centric architecture** with heavy use of GitHub’s own data hosting and APIs to compensate for lack of a traditional server. This yields a highly portable app that can be deployed simply by pushing to GitHub, yet still fulfill the complex workflow of innovation management by smart use of available web technologies.

## Conclusion

This specification described a comprehensive plan for an **Innovation and Project Management web application** that uses the GI2MO ontology to structure all aspects of idea and project data. We covered system architecture (a static-deployed SPA augmented by GitHub integration for data persistence), detailed data models aligning with GI2MO classes (Idea, IdeaContest, Review, etc.), user roles from idea contributors to project owners, and the step-by-step workflows from idea submission to project completion. The UI is designed with clarity and responsiveness, facilitating user engagement in collecting and refining ideas – especially focusing on the early stages of innovation (submission, clustering, evaluation, selection) which were given extensive detail as required. Later project execution stages are supported in a lightweight manner, ensuring continuity without overcomplicating the initial scope.

By fully leveraging GI2MO, the app ensures that every idea can be annotated with rich metadata and every process (reviews, statuses, attachments) is grounded in a semantic model for future interoperability. The use of GitHub Pages for deployment, while limiting in some ways, encourages an elegant design that emphasizes client-side functionality and integration over heavy infrastructure. It also opens the door to seamless future integration with GitHub Projects and other enterprise tools, since we have kept those extension points in mind throughout.

This specification serves as a blueprint for implementation. Next steps would include choosing specific frameworks (if any), setting up the GitHub OAuth app for authentication, implementing the data layer (likely using GitHub issues as a backend initially), and then coding the UI according to the described components. With careful adherence to this spec, the result will be an effective platform for innovation management – one that encourages participation, brings order and insight to a wealth of ideas, and drives the best ideas through to real-world projects. The system not only manages ideas but also, importantly, builds an **innovation knowledge base** that can be mined and cross-referenced thanks to its ontology-backed structure, benefiting the organization’s long-term learning and strategic decision-making.
