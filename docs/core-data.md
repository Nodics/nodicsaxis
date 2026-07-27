# Core Data Workspace

Axis renders the permission-filtered **Administration > Core Data** route
advertised by BackOffice. The workspace lets an authorized employee explicitly
request Nodics' existing core-data import after modules are installed or their
version-controlled baseline records change.

Axis owns only the confirmation, pending, success, and safe failure experience.
The Nodics nImport capability owns file discovery, validation, ordering,
duplicate protection, persistence, diagnostics, and the secured
`POST /nodics/system/v0/import/core` contract.

The route is absent when the employee does not have `import.core.run`. The
backend enforces that permission again when the operation is requested. Axis
keeps the employee access token in memory and sends the active enterprise code;
it does not store credentials, read sibling data folders, or connect to the
database.

After an import changes group permissions or session-derived policy, the
operator must sign out and sign in again. Axis does not silently elevate an
already-issued employee token.
