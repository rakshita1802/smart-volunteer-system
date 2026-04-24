
INSERT INTO issues (title, description, location, problem_type, severity, people_affected) VALUES
('Contaminated water supply', 'Residents reporting brown tap water for 3 days', 'Area A', 'water', 5, 450),
('No teacher for 3 months', 'Primary school has been without teacher', 'Area B', 'education', 4, 120),
('Dengue outbreak', 'Multiple fever cases reported this week', 'Area C', 'health', 5, 200),
('Food shortage', 'Families running out of supplies after floods', 'Area A', 'food', 4, 300),
('Damaged shelter after storm', 'Roof collapses in 5 homes', 'Area D', 'shelter', 3, 25);

INSERT INTO volunteers (name, email, phone, location, skills, availability) VALUES
('Priya Sharma', 'priya@example.com', '9876543210', 'Area A', ARRAY['medical','first_aid'], 'weekends'),
('Ramesh Kumar', 'ramesh@example.com', '9876543211', 'Area B', ARRAY['teaching','tutoring'], 'weekdays'),
('Anita Nair', 'anita@example.com', '9876543212', 'Area C', ARRAY['nursing','medical'], 'anytime'),
('Vikram Singh', 'vikram@example.com', '9876543213', 'Area A', ARRAY['engineering','plumbing'], 'weekdays'),
('Sita Devi', 'sita@example.com', '9876543214', 'Area D', ARRAY['construction','field_work'], 'weekends'),
('Arjun Mehta', 'arjun@example.com', '9876543215', 'Area B', ARRAY['logistics','field_work'], 'anytime');