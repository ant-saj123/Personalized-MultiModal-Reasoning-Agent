# Sprint Example: E-Commerce Platform Enhancement

## Sprint Overview
- **Sprint Number**: 12
- **Duration**: 2 weeks (Jan 15 - Jan 26, 2024)
- **Team**: Web Dev Squad (5 developers, 1 QA, 1 PM)
- **Goal**: Implement checkout process improvements and address critical bugs from previous sprint

## Sprint Metrics
| Metric               | Target | Actual |
|----------------------|--------|--------|
| Planned Capacity     | 80     | 78     |
| Story Points Committed | 35     | 35     |
| Story Points Completed | 35     | 32     |
| Bugs Created         | -      | 8      |
| Bugs Resolved        | -      | 6      |

## User Stories & Tasks

### 1. Streamline Checkout Process (8 points)
- **As a** customer  
- **I want to** complete checkout in fewer steps  
- **So that** I can purchase items faster  

**Tasks**:
- [x] Implement one-page checkout UI (FE-124)
- [ ] Add address autocomplete (FE-125) *[carried over]*
- [x] Optimize checkout API calls (BE-117)

### 2. Payment Method Management (5 points)
- **As a** customer  
- **I want to** save multiple payment methods  
- **So that** I can choose at checkout  

**Tasks**:
- [x] Create payment method storage UI (FE-126)
- [x] Develop secure payment API endpoint (BE-118)

### 3. Critical Bug Fixes (5 points)
- **Bug**: Checkout fails for users with special characters in names (BUG-247)
- **Bug**: Mobile cart icon shows incorrect count (BUG-251)

## Daily Standup Highlights
- **Day 3**: Blocked on FE-125 due to Google Maps API rate limits
- **Day 6**: QA environment downtime caused 1 day delay in testing
- **Day 9**: Pair programming session resolved complex checkout edge case

## Sprint Retrospective

### What Went Well
✔️ Effective collaboration between FE/BE teams  
✔️ Early QA involvement reduced rework  
✔️ Daily bug triage kept focus on quality  

### Improvements Needed
❗ Address API dependency risks earlier  
❗ Improve test data setup process  
❗ Balance feature work vs. tech debt (20/80 split suggested)  

### Action Items
1. Create API integration checklist (Assigned to: Tech Lead)
2. Schedule test data workshop (Assigned to: QA)
3. Allocate 5 points for tech debt next sprint

## Next Sprint Preview
**Focus Areas**:
- Mobile performance optimization
- User profile enhancements
- Technical debt: Checkout service refactor

**Forecasted Capacity**: 85 points