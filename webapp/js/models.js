const IdeaStatus = {
  DRAFT: 'Draft',
  UNDER_REVIEW: 'UnderReview',
  ACCEPTED: 'Accepted',
  IMPLEMENTED: 'Implemented',
  PARTIALLY_IMPLEMENTED: 'PartialyImplemented',
  REJECTED: 'Rejected',
  DEPLOYED: 'Deployed',
  ALREADY_EXISTS: 'AlreadyExists'
};

class Idea {
  constructor(title, description, category, status = IdeaStatus.DRAFT) {
    this['@type'] = GI2MO.Idea;
    this.title = title;
    this.description = description;
    this.category = category;
    this.status = status;
    this.created = new Date().toISOString();
    this.comments = [];
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

class Comment {
  constructor(text, author) {
    this['@type'] = GI2MO.Comment;
    this.text = text;
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
