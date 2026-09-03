import './MoodBoard.css';

export const MoodBoardItem = ({ color, image, description }) => {
  return (
    <div className="mood-board-item" style={{ backgroundColor: color }}>
      <img className="mood-board-image" src={image} alt={description} />
      <h3 className="mood-board-text">{description}</h3>
    </div>
  );
};

export const MoodBoard = () => {
  const destinations = [
    {
      id: 1,
      color: '#c2410c',
      image: 'https://cdn.freecodecamp.org/curriculum/labs/pathway.jpg',
      description: 'Pathway',
    },
    {
      id: 2,
      color: '#0369a1',
      image: 'https://cdn.freecodecamp.org/curriculum/labs/shore.jpg',
      description: 'Shore',
    },
    {
      id: 3,
      color: '#15803d',
      image: 'https://cdn.freecodecamp.org/curriculum/labs/grass.jpg',
      description: 'Grass',
    },
  ];

  return (
    <div>
      <h1 className="mood-board-heading">Destination Mood Board</h1>
      <div className="mood-board">
        {destinations.map((destination) => (
          <MoodBoardItem
            key={destination.id}
            color={destination.color}
            image={destination.image}
            description={destination.description}
          />
        ))}
      </div>
    </div>
  );
};

export default MoodBoard;
