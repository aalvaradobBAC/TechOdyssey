#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_NAME="TechOdyssey"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
SOLUTION="$ROOT/$PROJECT_NAME.sln"
FRONTEND="$ROOT/src/frontend"
RPG_ROOT="$ROOT/technologies/rpg"

cd "$ROOT"

step() {
  printf '\n\033[1;34m%s\033[0m\n' "$1"
}

info() {
  printf '\033[1;36m%s\033[0m\n' "$1"
}

skip() {
  printf '\033[1;33m[EXISTE] %s\033[0m\n' "$1"
}

created() {
  printf '\033[1;32m[CREADO] %s\033[0m\n' "$1"
}

fail() {
  printf '\n\033[1;31mERROR: %s\033[0m\n' "$1" >&2
  exit 1
}

on_error() {
  local exit_code=$?
  printf '\n\033[1;31mLa instalación falló en la línea %s.\033[0m\n' "$1" >&2
  printf 'Código de salida: %s\n' "$exit_code" >&2
  exit "$exit_code"
}

trap 'on_error $LINENO' ERR

create_directory() {
  local directory="$1"

  if [ -d "$directory" ]; then
    skip "$directory"
  else
    mkdir -p "$directory"
    created "$directory"
  fi
}

write_if_missing() {
  local target="$1"
  local temporary_file

  temporary_file="$(mktemp)"
  cat > "$temporary_file"

  if [ -f "$target" ]; then
    skip "$target"
    rm -f "$temporary_file"
    return
  fi

  mkdir -p "$(dirname "$target")"
  mv "$temporary_file" "$target"
  created "$target"
}

# ============================================================
# 1. VALIDAR HERRAMIENTAS
# ============================================================

step "1/12 - Validando herramientas"

for required_command in git node npm dotnet make; do
  if ! command -v "$required_command" >/dev/null 2>&1; then
    fail "No se encontró el comando requerido: $required_command"
  fi
done

if [ ! -d "$ROOT/.git" ]; then
  fail "La carpeta $ROOT no es un repositorio Git."
fi

echo "Git:       $(git --version)"
echo "Node.js:   $(node --version)"
echo "npm:       $(npm --version)"
echo ".NET SDK:  $(dotnet --version)"
echo "Make:      $(make --version | head -n 1)"
echo "Raíz:      $ROOT"

# ============================================================
# 2. CREAR ESTRUCTURA GENERAL
# ============================================================

step "2/12 - Validando estructura general"

general_directories=(
  "$ROOT/src/backend"
  "$ROOT/shared/curriculum/schemas"
  "$ROOT/shared/curriculum/templates"
  "$ROOT/shared/challenge-engine/contracts"
  "$ROOT/shared/challenge-engine/templates"
  "$ROOT/shared/gamification/badges"
  "$ROOT/shared/gamification/scoring"
  "$ROOT/shared/git-workflow/templates"
  "$ROOT/shared/testing/public-tests"
  "$ROOT/shared/testing/hidden-tests"
  "$ROOT/technologies"
  "$ROOT/templates/technology"
  "$ROOT/tests/backend"
  "$ROOT/tests/frontend"
  "$ROOT/tests/e2e"
  "$ROOT/tests/security"
  "$ROOT/tests/performance"
  "$ROOT/docs/architecture"
  "$ROOT/docs/development"
  "$ROOT/docs/recovery"
  "$ROOT/docs/security"
  "$ROOT/docs/decisions"
  "$ROOT/scripts"
  "$ROOT/infrastructure/docker"
  "$ROOT/infrastructure/pipelines"
  "$ROOT/infrastructure/environments/development"
  "$ROOT/infrastructure/environments/testing"
  "$ROOT/infrastructure/environments/production"
  "$ROOT/.devcontainer"
  "$ROOT/.github/workflows"
  "$ROOT/.github/ISSUE_TEMPLATE"
  "$ROOT/.github/PULL_REQUEST_TEMPLATE"
  "$ROOT/.vscode"
)

for directory in "${general_directories[@]}"; do
  create_directory "$directory"
done

# ============================================================
# 3. CREAR O VALIDAR SOLUCIÓN .NET
# ============================================================

step "3/12 - Validando solución .NET"

if [ -f "$SOLUTION" ]; then
  skip "$SOLUTION"
else
  dotnet new sln \
    --name "$PROJECT_NAME" \
    --format sln \
    --output "$ROOT"

  created "$SOLUTION"
fi

create_dotnet_project() {
  local template="$1"
  local name="$2"
  local output="$3"
  shift 3

  local project_file="$output/$name.csproj"

  if [ -f "$project_file" ]; then
    skip "$project_file"
    return
  fi

  dotnet new "$template" \
    --name "$name" \
    --output "$output" \
    "$@"

  created "$project_file"
}

create_dotnet_project \
  webapi \
  "$PROJECT_NAME.Api" \
  "$ROOT/src/backend/$PROJECT_NAME.Api" \
  --use-controllers \
  --no-https

create_dotnet_project \
  classlib \
  "$PROJECT_NAME.Domain" \
  "$ROOT/src/backend/$PROJECT_NAME.Domain"

create_dotnet_project \
  classlib \
  "$PROJECT_NAME.Application" \
  "$ROOT/src/backend/$PROJECT_NAME.Application"

create_dotnet_project \
  classlib \
  "$PROJECT_NAME.Infrastructure" \
  "$ROOT/src/backend/$PROJECT_NAME.Infrastructure"

create_dotnet_project \
  xunit \
  "$PROJECT_NAME.Domain.Tests" \
  "$ROOT/tests/backend/$PROJECT_NAME.Domain.Tests"

create_dotnet_project \
  xunit \
  "$PROJECT_NAME.Application.Tests" \
  "$ROOT/tests/backend/$PROJECT_NAME.Application.Tests"

create_dotnet_project \
  xunit \
  "$PROJECT_NAME.Api.IntegrationTests" \
  "$ROOT/tests/backend/$PROJECT_NAME.Api.IntegrationTests"

# ============================================================
# 4. VALIDAR PROYECTOS Y REFERENCIAS
# ============================================================

step "4/12 - Validando proyectos y referencias"

add_to_solution_if_missing() {
  local project_path="$1"
  local project_name

  project_name="$(basename "$project_path")"

  if dotnet sln "$SOLUTION" list | grep -Fq "$project_name"; then
    skip "Solución: $project_name"
  else
    dotnet sln "$SOLUTION" add "$project_path"
    created "Solución: $project_name"
  fi
}

add_to_solution_if_missing \
  "src/backend/$PROJECT_NAME.Api/$PROJECT_NAME.Api.csproj"

add_to_solution_if_missing \
  "src/backend/$PROJECT_NAME.Domain/$PROJECT_NAME.Domain.csproj"

add_to_solution_if_missing \
  "src/backend/$PROJECT_NAME.Application/$PROJECT_NAME.Application.csproj"

add_to_solution_if_missing \
  "src/backend/$PROJECT_NAME.Infrastructure/$PROJECT_NAME.Infrastructure.csproj"

add_to_solution_if_missing \
  "tests/backend/$PROJECT_NAME.Domain.Tests/$PROJECT_NAME.Domain.Tests.csproj"

add_to_solution_if_missing \
  "tests/backend/$PROJECT_NAME.Application.Tests/$PROJECT_NAME.Application.Tests.csproj"

add_to_solution_if_missing \
  "tests/backend/$PROJECT_NAME.Api.IntegrationTests/$PROJECT_NAME.Api.IntegrationTests.csproj"

add_reference_if_missing() {
  local source_project="$1"
  local target_project="$2"
  local target_name

  target_name="$(basename "$target_project")"

  if dotnet list "$source_project" reference |
      grep -Fq "$target_name"; then
    skip "Referencia: $target_name"
  else
    dotnet add "$source_project" reference "$target_project"
    created "Referencia: $target_name"
  fi
}

add_reference_if_missing \
  "src/backend/$PROJECT_NAME.Application/$PROJECT_NAME.Application.csproj" \
  "src/backend/$PROJECT_NAME.Domain/$PROJECT_NAME.Domain.csproj"

add_reference_if_missing \
  "src/backend/$PROJECT_NAME.Infrastructure/$PROJECT_NAME.Infrastructure.csproj" \
  "src/backend/$PROJECT_NAME.Domain/$PROJECT_NAME.Domain.csproj"

add_reference_if_missing \
  "src/backend/$PROJECT_NAME.Infrastructure/$PROJECT_NAME.Infrastructure.csproj" \
  "src/backend/$PROJECT_NAME.Application/$PROJECT_NAME.Application.csproj"

add_reference_if_missing \
  "src/backend/$PROJECT_NAME.Api/$PROJECT_NAME.Api.csproj" \
  "src/backend/$PROJECT_NAME.Application/$PROJECT_NAME.Application.csproj"

add_reference_if_missing \
  "src/backend/$PROJECT_NAME.Api/$PROJECT_NAME.Api.csproj" \
  "src/backend/$PROJECT_NAME.Infrastructure/$PROJECT_NAME.Infrastructure.csproj"

add_reference_if_missing \
  "tests/backend/$PROJECT_NAME.Domain.Tests/$PROJECT_NAME.Domain.Tests.csproj" \
  "src/backend/$PROJECT_NAME.Domain/$PROJECT_NAME.Domain.csproj"

add_reference_if_missing \
  "tests/backend/$PROJECT_NAME.Application.Tests/$PROJECT_NAME.Application.Tests.csproj" \
  "src/backend/$PROJECT_NAME.Application/$PROJECT_NAME.Application.csproj"

add_reference_if_missing \
  "tests/backend/$PROJECT_NAME.Api.IntegrationTests/$PROJECT_NAME.Api.IntegrationTests.csproj" \
  "src/backend/$PROJECT_NAME.Api/$PROJECT_NAME.Api.csproj"

backend_directories=(
  "src/backend/$PROJECT_NAME.Domain/Entities"
  "src/backend/$PROJECT_NAME.Domain/Enums"
  "src/backend/$PROJECT_NAME.Domain/ValueObjects"
  "src/backend/$PROJECT_NAME.Application/Abstractions"
  "src/backend/$PROJECT_NAME.Application/Features/Technologies"
  "src/backend/$PROJECT_NAME.Application/Features/Curriculum"
  "src/backend/$PROJECT_NAME.Application/Features/Challenges"
  "src/backend/$PROJECT_NAME.Application/Features/Progress"
  "src/backend/$PROJECT_NAME.Infrastructure/Content"
  "src/backend/$PROJECT_NAME.Infrastructure/Runtimes/Generic"
  "src/backend/$PROJECT_NAME.Infrastructure/Runtimes/IBMi"
)

for directory in "${backend_directories[@]}"; do
  create_directory "$ROOT/$directory"
done

write_if_missing \
  "$ROOT/src/backend/$PROJECT_NAME.Domain/Entities/Technology.cs" <<'EOF'
namespace TechOdyssey.Domain.Entities;

public sealed class Technology
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string Code { get; init; }

    public required string Name { get; set; }

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = "planned";

    public string Color { get; set; } = "#2563EB";

    public string Icon { get; set; } = "code";

    public int Order { get; set; }

    public bool IsActive => Status == "active";
}
EOF

write_if_missing \
  "$ROOT/src/backend/$PROJECT_NAME.Domain/Entities/LearningModule.cs" <<'EOF'
namespace TechOdyssey.Domain.Entities;

public sealed class LearningModule
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string TechnologyCode { get; init; }

    public required string Code { get; init; }

    public required string Title { get; set; }

    public string Description { get; set; } = string.Empty;

    public int Order { get; set; }

    public int RequiredScore { get; set; } = 80;

    public bool IsPublished { get; set; }
}
EOF

write_if_missing \
  "$ROOT/src/backend/$PROJECT_NAME.Domain/Entities/Challenge.cs" <<'EOF'
namespace TechOdyssey.Domain.Entities;

public sealed class Challenge
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string TechnologyCode { get; init; }

    public required string ModuleCode { get; init; }

    public required string Code { get; init; }

    public required string Title { get; set; }

    public string Description { get; set; } = string.Empty;

    public int ExperiencePoints { get; set; }

    public int MaximumExecutionSeconds { get; set; } = 10;

    public bool IsPublished { get; set; }
}
EOF

write_if_missing \
  "$ROOT/src/backend/$PROJECT_NAME.Application/Abstractions/ITechnologyRuntime.cs" <<'EOF'
namespace TechOdyssey.Application.Abstractions;

public interface ITechnologyRuntime
{
    string TechnologyCode { get; }

    Task<ValidationResult> ValidateAsync(
        ValidationRequest request,
        CancellationToken cancellationToken);
}

public sealed record ValidationRequest(
    string TechnologyCode,
    string ChallengeCode,
    string SourcePath,
    string SessionId);

public sealed record ValidationResult(
    bool Succeeded,
    int Score,
    IReadOnlyCollection<ValidationMessage> Messages);

public sealed record ValidationMessage(
    string Code,
    string Category,
    string Message,
    string? LearningHint);
EOF

# ============================================================
# 5. VALIDAR FRONTEND
# ============================================================

step "5/12 - Validando frontend React y TypeScript"

frontend_directories=(
  "$FRONTEND/src/models"
  "$FRONTEND/src/styles"
  "$FRONTEND/src/components/common"
  "$FRONTEND/src/components/layout"
  "$FRONTEND/src/components/technology"
  "$FRONTEND/src/components/learning"
  "$FRONTEND/src/components/editor"
  "$FRONTEND/src/components/git"
  "$FRONTEND/src/components/gamification"
  "$FRONTEND/src/features/catalog"
  "$FRONTEND/src/features/technologies"
  "$FRONTEND/src/features/curriculum"
  "$FRONTEND/src/features/lessons"
  "$FRONTEND/src/features/challenges"
  "$FRONTEND/src/features/progress"
  "$FRONTEND/src/pages"
  "$FRONTEND/src/routes"
  "$FRONTEND/src/services"
  "$FRONTEND/src/state"
  "$FRONTEND/src/utils"
  "$FRONTEND/public"
)

for directory in "${frontend_directories[@]}"; do
  create_directory "$directory"
done

if [ -f "$FRONTEND/package.json" ]; then
  skip "$FRONTEND/package.json"
else
  cat > "$FRONTEND/package.json" <<'EOF'
{
  "name": "techodyssey-web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.7.0",
    "axios": "^1.13.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.10.0",
    "zustand": "^5.0.0",
    "zod": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.1.0",
    "typescript": "~5.9.0",
    "vite": "^8.3.0"
  }
}
EOF

  created "$FRONTEND/package.json"
fi

write_if_missing "$FRONTEND/index.html" <<'EOF'
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <meta
      name="description"
      content="TechOdyssey, plataforma gamificada multitecnología."
    />
    <title>TechOdyssey</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

write_if_missing "$FRONTEND/tsconfig.json" <<'EOF'
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
EOF

write_if_missing "$FRONTEND/tsconfig.app.json" <<'EOF'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"]
}
EOF

write_if_missing "$FRONTEND/tsconfig.node.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
EOF

write_if_missing "$FRONTEND/vite.config.ts" <<'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
EOF

write_if_missing "$FRONTEND/src/vite-env.d.ts" <<'EOF'
/// <reference types="vite/client" />
EOF

write_if_missing "$FRONTEND/src/main.tsx" <<'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/app.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el elemento root.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
EOF

write_if_missing "$FRONTEND/src/models/technology.ts" <<'EOF'
export type TechnologyStatus = "active" | "planned" | "maintenance";

export interface Technology {
  id: string;
  name: string;
  description: string;
  status: TechnologyStatus;
  color: string;
  icon: string;
  path: string;
}
EOF

write_if_missing "$FRONTEND/src/data-technologies.ts" <<'EOF'
import type { Technology } from "./models/technology";

export const technologies: Technology[] = [
  {
    id: "rpg",
    name: "IBM i y RPG",
    description:
      "IBM i, RPG Free, Db2 for i, ILE, Git y modernización de aplicaciones heredadas.",
    status: "active",
    color: "#2563eb",
    icon: "RPG",
    path: "/technologies/rpg",
  },
  {
    id: "python",
    name: "Python",
    description:
      "Programación, automatización, procesamiento de datos e integración.",
    status: "planned",
    color: "#3776ab",
    icon: "PY",
    path: "/technologies/python",
  },
  {
    id: "java",
    name: "Java",
    description:
      "Desarrollo orientado a objetos y aplicaciones empresariales.",
    status: "planned",
    color: "#e76f00",
    icon: "JV",
    path: "/technologies/java",
  },
  {
    id: "pega",
    name: "Pega Platform",
    description:
      "Diseño de casos, reglas, integraciones y automatización low-code.",
    status: "planned",
    color: "#00a6a6",
    icon: "PG",
    path: "/technologies/pega",
  },
];
EOF

create_techodyssey_app() {
  cat > "$FRONTEND/src/App.tsx" <<'EOF'
import { technologies } from "./data-technologies";

function App() {
  return (
    <main>
      <header className="hero">
        <nav className="navigation">
          <a className="brand" href="/">TechOdyssey</a>
          <a href="#technologies">Tecnologías</a>
        </nav>

        <div className="heroContent">
          <span className="eyebrow">
            Formación tecnológica interactiva
          </span>

          <h1>Aprende tecnología construyendo soluciones reales</h1>

          <p>
            Aprende cada concepto, practica con acompañamiento y
            demuestra el dominio mediante retos, pruebas y revisiones.
          </p>

          <a className="primaryButton" href="#technologies">
            Explorar tecnologías
          </a>
        </div>
      </header>

      <section className="section" id="technologies">
        <div className="sectionHeading">
          <span className="eyebrow">Catálogo</span>
          <h2>Tecnologías</h2>

          <p>
            Cada tecnología tiene su propio currículo, laboratorios,
            retos, pruebas, recursos y proyecto integrador.
          </p>
        </div>

        <div className="technologyGrid">
          {technologies.map((technology) => (
            <article
              className={
                technology.status === "active"
                  ? "technologyCard technologyCardActive"
                  : "technologyCard"
              }
              key={technology.id}
            >
              <div
                className="technologyIcon"
                style={{ backgroundColor: technology.color }}
              >
                {technology.icon}
              </div>

              <span
                className={
                  technology.status === "active"
                    ? "status statusActive"
                    : "status statusPlanned"
                }
              >
                {technology.status === "active"
                  ? "Disponible"
                  : "Próximamente"}
              </span>

              <h3>{technology.name}</h3>
              <p>{technology.description}</p>

              {technology.status === "active" ? (
                <a className="cardButton" href={technology.path}>
                  Iniciar ruta
                </a>
              ) : (
                <button
                  className="cardButton cardButtonDisabled"
                  disabled
                  type="button"
                >
                  En preparación
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="learningModel">
        <div className="sectionHeading">
          <span className="eyebrow">Modelo de aprendizaje</span>
          <h2>Primero aprende, después resuelve</h2>
        </div>

        <div className="steps">
          {[
            ["01", "Aprender", "Explicación del concepto."],
            ["02", "Observar", "Demostración aplicada."],
            ["03", "Practicar", "Laboratorio guiado."],
            ["04", "Resolver", "Reto autónomo."],
            ["05", "Validar", "Pruebas y revisión."],
          ].map(([number, title, description]) => (
            <article className="step" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
EOF
}

if [ ! -f "$FRONTEND/src/App.tsx" ]; then
  create_techodyssey_app
  created "$FRONTEND/src/App.tsx"
elif grep -Eq \
  "Get started|Count is|useState|viteLogo|reactLogo" \
  "$FRONTEND/src/App.tsx"; then

  cp \
    "$FRONTEND/src/App.tsx" \
    "$FRONTEND/src/App.tsx.vite-backup"

  create_techodyssey_app

  info "Se conservó respaldo en App.tsx.vite-backup"
else
  skip "$FRONTEND/src/App.tsx"
fi

write_if_missing "$FRONTEND/src/styles/app.css" <<'EOF'
:root {
  color: #14213d;
  background: #f4f7fb;
  font-family: Inter, system-ui, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
a {
  font: inherit;
}

.hero {
  min-height: 600px;
  color: #ffffff;
  background:
    radial-gradient(
      circle at 80% 20%,
      rgba(37, 99, 235, 0.35),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #071426 0%,
      #0f2744 55%,
      #143761 100%
    );
}

.navigation {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 24px 0;
  display: flex;
  justify-content: space-between;
}

.brand {
  font-size: 24px;
  font-weight: 800;
}

.heroContent {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 100px 0;
}

.heroContent h1 {
  max-width: 780px;
  margin: 14px 0 24px;
  font-size: clamp(42px, 6vw, 72px);
  line-height: 1.04;
}

.heroContent p {
  max-width: 700px;
  margin-bottom: 34px;
  color: #cbd5e1;
  font-size: 20px;
  line-height: 1.6;
}

.eyebrow {
  color: #60a5fa;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.primaryButton,
.cardButton {
  min-height: 46px;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #2563eb;
  cursor: pointer;
  font-weight: 750;
}

.section,
.learningModel {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 90px 0;
}

.sectionHeading {
  max-width: 700px;
  margin-bottom: 38px;
}

.sectionHeading h2 {
  margin: 10px 0;
  font-size: clamp(32px, 4vw, 46px);
}

.sectionHeading p {
  color: #53657a;
  font-size: 18px;
}

.technologyGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.technologyCard {
  min-height: 350px;
  padding: 26px;
  display: flex;
  flex-direction: column;
  border: 1px solid #dce4ed;
  border-radius: 14px;
  background: #ffffff;
}

.technologyCardActive {
  border-color: #93b4f8;
  box-shadow: 0 18px 45px rgba(37, 99, 235, 0.14);
}

.technologyIcon {
  width: 56px;
  height: 56px;
  margin-bottom: 22px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: #ffffff;
  font-weight: 900;
}

.status {
  width: max-content;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.statusActive {
  color: #166534;
  background: #dcfce7;
}

.statusPlanned {
  color: #854d0e;
  background: #fef9c3;
}

.technologyCard h3 {
  margin: 18px 0 8px;
  font-size: 23px;
}

.technologyCard p {
  flex: 1;
  color: #5f6f82;
  line-height: 1.55;
}

.cardButton {
  width: 100%;
}

.cardButtonDisabled {
  color: #7b8796;
  background: #e5eaf0;
  cursor: not-allowed;
}

.learningModel {
  width: 100%;
  padding-right: max(24px, calc((100% - 1180px) / 2));
  padding-left: max(24px, calc((100% - 1180px) / 2));
  color: #ffffff;
  background: #0f2744;
}

.learningModel .sectionHeading h2 {
  color: #ffffff;
}

.steps {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
}

.step {
  padding: 24px;
  border: 1px solid #36516e;
  border-radius: 12px;
  background: #173657;
}

.step span {
  color: #60a5fa;
  font-weight: 800;
}

.step p {
  color: #cbd5e1;
}

@media (max-width: 1000px) {
  .technologyGrid,
  .steps {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 680px) {
  .technologyGrid,
  .steps {
    grid-template-columns: 1fr;
  }
}
EOF

if [ -d "$FRONTEND/node_modules" ] &&
   npm --prefix "$FRONTEND" ls --depth=0 >/dev/null 2>&1; then
  skip "Dependencias npm"
else
  info "Instalando dependencias npm faltantes..."
  npm --prefix "$FRONTEND" install \
    --no-fund \
    --no-audit \
    --yes
fi

# ============================================================
# 6. CATÁLOGO DE TECNOLOGÍAS
# ============================================================

step "6/12 - Validando catálogo de tecnologías"

write_if_missing "$ROOT/technologies/registry.yml" <<'EOF'
version: 1.0.0

technologies:
  - id: rpg
    name: RPG
    display_name: IBM i y RPG
    description: Desarrollo y modernización de aplicaciones IBM i.
    status: active
    path: technologies/rpg
    color: "#2563EB"
    order: 1

  - id: python
    name: Python
    display_name: Python
    description: Programación y automatización con Python.
    status: planned
    path: technologies/python
    color: "#3776AB"
    order: 2

  - id: java
    name: Java
    display_name: Java
    description: Desarrollo de aplicaciones empresariales.
    status: planned
    path: technologies/java
    color: "#E76F00"
    order: 3

  - id: pega
    name: Pega
    display_name: Pega Platform
    description: Desarrollo low-code y automatización.
    status: planned
    path: technologies/pega
    color: "#00A6A6"
    order: 4
EOF

# ============================================================
# 7. ESTRUCTURA RPG
# ============================================================

step "7/12 - Validando estructura de IBM i y RPG"

rpg_directories=(
  "$RPG_ROOT/curriculum/modules"
  "$RPG_ROOT/curriculum/learning-paths"
  "$RPG_ROOT/curriculum/rubrics"
  "$RPG_ROOT/curriculum/shared/glossary"
  "$RPG_ROOT/curriculum/shared/resources/videos"
  "$RPG_ROOT/curriculum/shared/resources/documentation"
  "$RPG_ROOT/curriculum/shared/standards"
  "$RPG_ROOT/challenges/templates"
  "$RPG_ROOT/challenges/published"
  "$RPG_ROOT/challenges/drafts"
  "$RPG_ROOT/challenges/archived"
  "$RPG_ROOT/challenges/shared/rpg"
  "$RPG_ROOT/challenges/shared/sql"
  "$RPG_ROOT/challenges/shared/cl"
  "$RPG_ROOT/challenges/shared/test-data"
  "$RPG_ROOT/labs/guided"
  "$RPG_ROOT/labs/practice"
  "$RPG_ROOT/labs/sandboxes"
  "$RPG_ROOT/tests/public"
  "$RPG_ROOT/tests/hidden"
  "$RPG_ROOT/tests/integration"
  "$RPG_ROOT/resources/videos"
  "$RPG_ROOT/resources/documentation"
  "$RPG_ROOT/resources/examples/rpgle"
  "$RPG_ROOT/resources/examples/sqlrpgle"
  "$RPG_ROOT/resources/examples/clle"
  "$RPG_ROOT/runtime/compilation"
  "$RPG_ROOT/runtime/execution"
  "$RPG_ROOT/runtime/diagnostics"
  "$RPG_ROOT/runtime/security"
  "$RPG_ROOT/assets/images"
  "$RPG_ROOT/assets/icons"
)

for directory in "${rpg_directories[@]}"; do
  create_directory "$directory"
done

write_if_missing "$RPG_ROOT/technology.yml" <<'EOF'
id: rpg
name: RPG
display_name: IBM i y RPG
version: 0.1.0
status: active
order: 1

description: >
  Ruta formativa para IBM i, Visual Studio Code, RPG Free,
  Db2 for i, ILE, Git y modernización de aplicaciones.

entry_module: M00

completion:
  minimum_score: 80
  capstone_required: true

runtime:
  type: ibmi
  enabled: false
  isolation: library-per-session
  library_prefix: TRN_
EOF

write_if_missing "$RPG_ROOT/README.md" <<'EOF'
# IBM i y RPG

Ruta de aprendizaje gamificada para IBM i, Visual Studio Code,
RPG Free, Db2 for i, ILE, Git, pruebas y modernización.

## Secuencia pedagógica

1. Contexto.
2. Explicación.
3. Demostración.
4. Práctica guiada.
5. Práctica con apoyo decreciente.
6. Reto autónomo.
7. Pruebas.
8. Retroalimentación.
9. Commit de aprendizaje.
EOF

# ============================================================
# 8. MÓDULOS RPG
# ============================================================

step "8/12 - Validando módulos de RPG"

modules=(
  "M00|diagnostico|Diagnóstico y ruta personalizada"
  "M01|ibmi-vscode|IBM i y Visual Studio Code"
  "M02|anatomia-rpg|Anatomía de un programa RPG"
  "M03|variables-tipos|Variables, constantes y tipos"
  "M04|operadores-expresiones|Operadores y expresiones"
  "M05|control-flujo|Control de flujo"
  "M06|ciclos|Ciclos y procesamiento repetitivo"
  "M07|funciones-integradas|Funciones integradas"
  "M08|estructuras-arreglos|Estructuras de datos y arreglos"
  "M09|sql-embebido|Db2 for i y SQL embebido"
  "M10|acceso-nativo|Acceso nativo a archivos"
  "M11|procedimientos-ile|Procedimientos e ILE"
  "M12|errores-observabilidad|Errores, logging y observabilidad"
  "M13|pruebas|Pruebas de software"
  "M14|git-colaboracion|Git y trabajo colaborativo"
  "M15|rpg-fijo|Lectura de RPG fijo"
  "M16|modernizacion|Modernización a RPG Free"
  "M17|ia-desarrollo|IA aplicada al desarrollo IBM i"
  "M18|proyecto-integrador|Proyecto integrador"
)

previous_id=""

for module_definition in "${modules[@]}"; do
  IFS='|' read -r module_id module_slug module_title \
    <<< "$module_definition"

  module_path="$RPG_ROOT/curriculum/modules/${module_id}-${module_slug}"
  module_number="${module_id#M}"
  module_order=$((10#$module_number))

  module_directories=(
    "$module_path/submodules"
    "$module_path/lessons"
    "$module_path/demos"
    "$module_path/guided-labs"
    "$module_path/practices"
    "$module_path/challenges"
    "$module_path/boss-fight"
    "$module_path/resources"
    "$module_path/assessments"
    "$module_path/tests/public"
    "$module_path/tests/hidden"
  )

  for directory in "${module_directories[@]}"; do
    create_directory "$directory"
  done

  if [ -z "$previous_id" ]; then
    prerequisites="[]"
  else
    prerequisites="[$previous_id]"
  fi

  if [ ! -f "$module_path/module.yml" ]; then
    cat > "$module_path/module.yml" <<EOF
id: $module_id
technology: rpg
title: "$module_title"
version: 0.1.0
status: draft
order: $module_order

prerequisites: $prerequisites

estimated_hours:
  theory: 0
  demonstrations: 0
  guided_labs: 0
  practices: 0
  challenges: 0

completion:
  conceptual_score: 80
  required_labs: 0
  required_challenges: 0
  boss_fight: false
EOF

    created "$module_path/module.yml"
  else
    skip "$module_path/module.yml"
  fi

  if [ ! -f "$module_path/README.md" ]; then
    cat > "$module_path/README.md" <<EOF
# $module_id - $module_title

## Objetivo

Pendiente de definir.

## Resultados de aprendizaje

- Pendiente.

## Submódulos

- Pendiente.

## Temas y subtemas

- Pendiente.

## Prácticas guiadas

- Pendiente.

## Retos

- Pendiente.

## Criterios de finalización

- Evaluación conceptual mínima: 80%.
- Laboratorios obligatorios completados.
- Retos requeridos superados.
EOF

    created "$module_path/README.md"
  else
    skip "$module_path/README.md"
  fi

  previous_id="$module_id"
done

# ============================================================
# 9. PLANTILLA DE TECNOLOGÍA
# ============================================================

step "9/12 - Validando plantilla para nuevas tecnologías"

template_directories=(
  "$ROOT/templates/technology/curriculum/modules"
  "$ROOT/templates/technology/curriculum/learning-paths"
  "$ROOT/templates/technology/curriculum/rubrics"
  "$ROOT/templates/technology/challenges/templates"
  "$ROOT/templates/technology/challenges/drafts"
  "$ROOT/templates/technology/challenges/published"
  "$ROOT/templates/technology/labs/guided"
  "$ROOT/templates/technology/labs/practice"
  "$ROOT/templates/technology/tests/public"
  "$ROOT/templates/technology/tests/hidden"
  "$ROOT/templates/technology/resources"
  "$ROOT/templates/technology/runtime"
  "$ROOT/templates/technology/assets"
)

for directory in "${template_directories[@]}"; do
  create_directory "$directory"
done

write_if_missing "$ROOT/templates/technology/technology.yml" <<'EOF'
id: TECHNOLOGY_ID
name: TECHNOLOGY_NAME
display_name: TECHNOLOGY_DISPLAY_NAME
version: 0.1.0
status: planned

description: >
  Descripción de la tecnología.

entry_module: M00

completion:
  minimum_score: 80
  capstone_required: true

runtime:
  type: generic
  enabled: false
EOF

# ============================================================
# 10. AUTOMATIZACIÓN
# ============================================================

step "10/12 - Validando automatización"

write_if_missing "$ROOT/Makefile" <<'EOF'
SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help setup validate start-api start-web status clean rebuild

help:
	@echo ""
	@echo "TechOdyssey"
	@echo "-----------"
	@echo "make setup       Crea o completa la plataforma"
	@echo "make validate    Compila y prueba la solución"
	@echo "make start-api   Ejecuta la API en el puerto 5048"
	@echo "make start-web   Ejecuta el portal en el puerto 5173"
	@echo "make status      Muestra el estado"
	@echo "make clean       Elimina artefactos generados"
	@echo "make rebuild     Limpia y valida nuevamente"

setup:
	@./setup.sh

validate:
	@./scripts/validate.sh

start-api:
	@./scripts/start-api.sh

start-web:
	@./scripts/start-web.sh

status:
	@echo "Git:     $$(git --version)"
	@echo "Node:    $$(node --version)"
	@echo "npm:     $$(npm --version)"
	@echo ".NET:    $$(dotnet --version)"
	@echo "Carpeta: $$(pwd)"
	@echo ""
	@git status --short --branch

clean:
	@find . -type d \( \
		-name bin -o \
		-name obj -o \
		-name dist -o \
		-name coverage \
	\) -prune -exec rm -rf {} +
	@echo "Artefactos eliminados."

rebuild: clean validate
EOF

write_if_missing "$ROOT/scripts/validate.sh" <<'EOF'
#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

dotnet restore TechOdyssey.sln
dotnet build TechOdyssey.sln --no-restore
dotnet test TechOdyssey.sln --no-build

if [ ! -d "src/frontend/node_modules" ]; then
  npm --prefix src/frontend install --no-fund --no-audit --yes
fi

npm --prefix src/frontend run build

echo "Validación completada correctamente."
EOF

write_if_missing "$ROOT/scripts/start-api.sh" <<'EOF'
#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

exec dotnet run \
  --project src/backend/TechOdyssey.Api \
  --urls http://0.0.0.0:5048
EOF

write_if_missing "$ROOT/scripts/start-web.sh" <<'EOF'
#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

exec npm --prefix src/frontend run dev -- --host 0.0.0.0
EOF

chmod +x \
  "$ROOT/setup.sh" \
  "$ROOT/scripts/validate.sh" \
  "$ROOT/scripts/start-api.sh" \
  "$ROOT/scripts/start-web.sh"

# ============================================================
# 11. DOCUMENTACIÓN
# ============================================================

step "11/12 - Validando documentación"

write_if_missing \
  "$ROOT/docs/architecture/repository-structure.md" <<'EOF'
# Estructura del repositorio

## Plataforma común

- `src/frontend`: portal web multitecnología.
- `src/backend`: API y servicios comunes.
- `shared`: componentes reutilizables.
- `technologies`: contenido específico por tecnología.
- `templates`: plantilla para nuevas tecnologías.
- `scripts`: automatización.
- `infrastructure`: despliegue y pipelines.
- `docs`: arquitectura, desarrollo y recuperación.

## Tecnologías

Cada tecnología reside en:

```text
technologies/<technology-id>
EOF