class Ship:
    def __init__(self, name, size, xpos=None, ypos=None, orientation=None):
        self.name = name
        self.size = size
        self.xpos = xpos
        self.ypos = ypos
        self.orientation = orientation
        self.coordinates = []
        self.hits = 0

        if all(val is not None for val in [xpos, ypos, orientation]):
            self.calculate_coordinates()

    def calculate_coordinates(self):
        self.coordinates = []
        for i in range(self.size):
            if self.orientation == 'horizontal':
                self.coordinates.append((self.xpos + i, self.ypos))
            else:
                self.coordinates.append((self.xpos, self.ypos + i))

    def is_sunk(self):
        return self.hits >= self.size
    
    def to_dict_save(self):
        return {
            "name": self.name,
            "size": self.size,
            "xpos": self.xpos,
            "ypos": self.ypos,
            "orientation": self.orientation,
            "coordinates": self.coordinates,
            "hits": self.hits
        }
    
    @classmethod
    def from_dict_save(cls, data):
        ship = cls(
            name=data['name'],
            size=data['size'],
            xpos=data['xpos'],
            ypos=data['ypos'],
            orientation=data['orientation']
        )
        ship.coordinates = data.get('coordinates', [])
        ship.hits = data.get('hits', 0)
        return ship