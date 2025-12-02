# GitHub Spec Kit Documentation

This repository has been initialized with the [GitHub Spec Kit](https://github.com/github/spec-kit).

## Overview
The GitHub Spec Kit is a toolkit designed to integrate Spec-Driven Development (SDD) with AI. It helps you create high-quality software by focusing on specifications first.

## Workflow Phases
1.  **Specify**: Define what to build (User Stories, Requirements).
2.  **Plan**: Define how to build it (Tech Stack, Architecture).
3.  **Tasks**: Break down the plan into actionable tasks.
4.  **Implement**: Execute the tasks to write code.

## Available Commands
Since you are using Gemini, the following slash commands are available in your AI assistant:

### Core Commands
- `/speckit.constitution`: Create your project's governing principles (e.g., code style, testing standards). **Run this first!**
- `/speckit.specify`: Generate a comprehensive specification document.
- `/speckit.plan`: Create a technical implementation plan based on the spec.
- `/speckit.tasks`: Break down the plan into a task list.
- `/speckit.implement`: Generate code based on the tasks and plan.

### Optional Commands
- `/speckit.clarify`: Clarify requirements before planning.
- `/speckit.analyze`: Analyze consistency across artifacts.
- `/speckit.checklist`: Generate quality checklists.

## Getting Started
1.  **Establish Principles**: Run `/speckit.constitution` to set up your project's "Constitution".
2.  **Create a Spec**: Run `/speckit.specify` with a high-level description of your feature.
3.  **Plan**: Run `/speckit.plan` to generate a technical plan.
4.  **Tasking**: Run `/speckit.tasks` to create a checklist.
5.  **Implement**: Run `/speckit.implement` to start coding.

## Directory Structure
- `.specify/`: Contains templates and scripts for the Spec Kit.
- `.gemini/commands/`: Contains the prompt templates for the slash commands.
