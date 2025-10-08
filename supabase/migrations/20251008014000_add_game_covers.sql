-- Update game covers for existing games
UPDATE games SET image_url = '/aladdinsnes.jpg' WHERE title LIKE '%Aladdin%';
UPDATE games SET image_url = '/Donkey_Kong_Country_SNES_cover.png' WHERE title LIKE '%Donkey Kong%';
UPDATE games SET image_url = '/Super_Mario_World_Coverart.png' WHERE title LIKE '%Super Mario World%';
