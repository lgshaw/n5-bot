export const checkCloak = (equipmentData) => {

    const backObj = equipmentData.equipped_items.filter(obj => {          
      return obj.slot.name === 'Back'
    })
  
    const cloak = Object.assign(...backObj);
  
    if(cloak.name_description) {
      return `- **Cloak**: ${cloak.name_description.display_string}`;
    } else {
      return '';
    }
};