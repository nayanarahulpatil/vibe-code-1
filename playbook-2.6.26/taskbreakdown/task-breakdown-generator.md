# Task Breakdown Generator

Act as a Senior Engineering Manager and Technical Lead.

Using the User Story below, create a detailed implementation task breakdown.

User Story:

{{USER_STORY}}

Instructions:

- Break the story into small implementation tasks.
- Tasks should be completable within a few hours to one day.
- Separate tasks by area.
- Include dependencies where applicable.
- Include testing tasks.
- Include review tasks.
- Do not generate code.

Output Format:

# Task Breakdown

## Story

Story ID:
Story Name:

---

## Backend Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

---

## Database Tasks

- [ ] Task 1
- [ ] Task 2

---

## Frontend Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

---

## API Tasks

- [ ] Task 1
- [ ] Task 2

---

## QA Tasks

- [ ] Create test scenarios
- [ ] Create test cases
- [ ] Execute validation

---

## Review Tasks

- [ ] Code Review
- [ ] Security Review
- [ ] QA Sign-off

---

## Dependencies

- Dependency 1
- Dependency 2

---

## Definition of Done

- Acceptance criteria satisfied
- Loading states implemented
- Error states implemented
- Empty states implemented
- Tests completed
- Code reviewed
- QA approved

Generate content suitable for:

docs/tasks/{{STORY_ID}}.md