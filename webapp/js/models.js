const IdeaStatus = {
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In Review',
  IMPLEMENTED: 'Implemented'
};

class Idea {
  constructor(title, description, category, status = IdeaStatus.SUBMITTED) {
    this['@type'] = GI2MO.Idea;
    this.title = title;
    this.description = description;
    this.category = category;
    this.status = status;
    this.created = new Date().toISOString();
  }
}

class IdeaContest {
  constructor(title, description, startDate, endDate) {
    this['@type'] = GI2MO.IdeaContest;
    this.title = title;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

class Review {
  constructor(text, score, author) {
    this['@type'] = GI2MO.Review;
    this.text = text;
    this.score = score;
    this.author = author;
    this.created = new Date().toISOString();
  }
}

class Project {
  constructor(name) {
    this['@type'] = GI2MO.Project;
    this.name = name;
  }
}
