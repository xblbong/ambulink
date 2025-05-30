// Indonesia Data Helper Module
window.indonesiaData = {
    // Cache for provinces and cities data
    data: null,

    // Fetch data from JSON file
    async fetchData() {
        if (this.data) return this.data;
        
        try {
            const response = await fetch('/data/indonesia.json');
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.error('Error loading Indonesia data:', error);
            return [];
        }
    },

    // Populate provinces select element
    async populateProvinces() {
        const data = await this.fetchData();
        const provinsiSelect = document.getElementById('provinsi');
        
        // Clear existing options except the first one
        provinsiSelect.innerHTML = '<option value="">Pilih Provinsi</option>';
        
        // Add provinces
        data.forEach(provinsi => {
            const option = document.createElement('option');
            option.value = provinsi.name;
            option.textContent = provinsi.name;
            provinsiSelect.appendChild(option);
        });
    },

    // Populate cities datalist based on selected province
    async populateCities(selectedProvinsi) {
        const data = await this.fetchData();
        const kotaDatalist = document.getElementById('kotaList');
        const kotaInput = document.getElementById('kota');
        
        // Clear existing options and input
        kotaDatalist.innerHTML = '';
        kotaInput.value = '';
        
        if (selectedProvinsi) {
            const provinsiData = data.find(p => p.name === selectedProvinsi);
            if (provinsiData && provinsiData.cities) {
                provinsiData.cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    kotaDatalist.appendChild(option);
                });
            }
        }
    }
}; 